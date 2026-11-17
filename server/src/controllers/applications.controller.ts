import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  Application,
  ApplicationStatusHistory,
  Internship,
  Company,
  CompanyMember,
  User,
  Notification,
} from '../models/index.js';
import { GuardAgent } from '../services/agents/guard-agent.js';

export async function getApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { status, internship_id, student_id } = req.query;
    const filter: any = {};

    if (user.role === 'student') {
      filter.student_id = user.id;
    } else if (user.role === 'recruiter') {
      if (internship_id) {
        filter.internship_id = internship_id;
      } else {
        const membership = await CompanyMember.findOne({ user_id: user.id });
        if (membership) {
          const companyInternships = await Internship.find({ company_id: membership.company_id }).select('_id');
          filter.internship_id = { $in: companyInternships.map((i) => i.id) };
        }
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (student_id && user.role !== 'student') {
      filter.student_id = student_id;
    }

    const applications = await Application.find(filter).sort({ applied_at: -1 });

    // Populate relations
    const internshipIds = [...new Set(applications.map((a) => a.internship_id))];
    const studentIds = [...new Set(applications.map((a) => a.student_id))];

    const [internships, students] = await Promise.all([
      Internship.find({ _id: { $in: internshipIds } }),
      User.find({ _id: { $in: studentIds } }),
    ]);

    const companyIds = [...new Set(internships.map((i) => i.company_id))];
    const companies = await Company.find({ _id: { $in: companyIds } });

    const companyMap = new Map(companies.map((c) => [c.id, c.toJSON()]));
    const internshipMap = new Map(
      internships.map((i) => [
        i.id,
        {
          ...i.toJSON(),
          company: companyMap.get(i.company_id),
        },
      ])
    );
    const studentMap = new Map(students.map((s) => [s.id, s.toJSON()]));

    const result = applications.map((app) => ({
      ...app.toJSON(),
      internship: internshipMap.get(app.internship_id) || null,
      student: studentMap.get(app.student_id) || null,
    }));

    return res.json({
      success: true,
      applications: result,
      count: result.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getApplicationById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const [internship, student, history] = await Promise.all([
      Internship.findById(application.internship_id),
      User.findById(application.student_id),
      ApplicationStatusHistory.find({ application_id: id }).sort({ changed_at: 1 }),
    ]);

    let company = null;
    if (internship) {
      company = await Company.findById(internship.company_id);
    }

    return res.json({
      success: true,
      application: {
        ...application.toJSON(),
        internship: internship ? { ...internship.toJSON(), company: company ? company.toJSON() : null } : null,
        student: student ? student.toJSON() : null,
        history: history.map((h) => h.toJSON()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function applyToInternship(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user || user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only student accounts can apply to internships.' });
    }

    const { internship_id, cover_letter, screening_answers, portfolio_links } = req.body;

    if (!internship_id) {
      return res.status(400).json({ success: false, error: 'Internship ID is required.' });
    }

    const internship = await Internship.findById(internship_id);
    if (!internship) {
      return res.status(404).json({ success: false, error: 'Internship not found.' });
    }

    // NON-NEGOTIABLE CHECK: A student cannot apply to the same internship more than once
    const existing = await Application.findOne({
      student_id: user.id,
      internship_id: internship_id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A student cannot apply to the same internship more than once.',
        code: 'DUPLICATE_APPLICATION',
      });
    }

    // Run Guard verification
    const guardResult = await GuardAgent.verifyEligibility(user.id, internship_id);
    if (!guardResult.passed) {
      return res.status(400).json({
        success: false,
        error: 'Eligibility verification failed: ' + guardResult.reasons.join(', '),
        details: guardResult,
      });
    }

    const appId = 'app-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    let application;
    try {
      application = await Application.create({
        _id: appId,
        student_id: user.id,
        internship_id: internship_id,
        status: 'applied',
        cover_letter: cover_letter || '',
        screening_answers: screening_answers || {},
        match_score: guardResult.score || 85,
        applied_at: new Date(),
        metadata: {
          guard_verified: true,
          portfolio_links: portfolio_links || [],
        },
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'A student cannot apply to the same internship more than once.',
          code: 'DUPLICATE_APPLICATION',
        });
      }
      throw err;
    }

    // Record initial status history
    await ApplicationStatusHistory.create({
      _id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      application_id: appId,
      to_status: 'applied',
      note: 'Application submitted successfully via InternBridge.',
      changed_by: user.id,
      changed_at: new Date(),
    });

    // Notify student
    await Notification.create({
      _id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: user.id,
      title: 'Application Submitted',
      message: `Your application for ${internship.title} has been received.`,
      type: 'application_submitted',
      link: `/student/applications/${appId}`,
      is_read: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application: application.toJSON(),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'A student cannot apply to the same internship more than once.',
        code: 'DUPLICATE_APPLICATION',
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateApplicationStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only recruiters or admins can update application status.' });
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'offered', 'rejected', 'withdrawn'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const fromStatus = application.status;
    application.status = status;
    await application.save();

    await ApplicationStatusHistory.create({
      _id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      application_id: id,
      from_status: fromStatus,
      to_status: status,
      note: note || `Status updated from ${fromStatus} to ${status}.`,
      changed_by: user.id,
      changed_at: new Date(),
    });

    const internship = await Internship.findById(application.internship_id);
    await Notification.create({
      _id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: application.student_id,
      title: 'Application Status Update',
      message: `Your application for ${internship?.title || 'internship'} is now marked as ${status.replace('_', ' ')}.`,
      type: 'status_changed',
      link: `/student/applications/${id}`,
      is_read: false,
    });

    return res.json({
      success: true,
      message: `Status updated to ${status}.`,
      application: application.toJSON(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
