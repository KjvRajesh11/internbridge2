import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  User,
  Company,
  CompanyMember,
  Internship,
  Application,
  Interview,
  StudentSkill,
  StudentProject,
} from '../models/index.js';

async function getRecruiterCompany(userId: string) {
  const membership = await CompanyMember.findOne({ user_id: userId });
  if (!membership) return null;
  return Company.findById(membership.company_id);
}

export async function getRecruiterDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const company = await getRecruiterCompany(userId);
    if (!company) {
      return res.status(404).json({ success: false, error: 'No associated company found.' });
    }

    const internships = await Internship.find({ company_id: company.id });
    const internshipIds = internships.map((i) => i.id);

    const applications = await Application.find({ internship_id: { $in: internshipIds } }).sort({ applied_at: -1 });
    const interviews = await Interview.find({ internship_id: { $in: internshipIds } });

    // Recent applicants with student & internship details
    const studentIds = applications.slice(0, 10).map((a) => a.student_id);
    const students = await User.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s.id, s.toJSON()]));
    const internshipMap = new Map(internships.map((i) => [i.id, i.toJSON()]));

    const recentApplicants = applications.slice(0, 10).map((a) => ({
      ...a.toJSON(),
      student: studentMap.get(a.student_id) || null,
      internship: internshipMap.get(a.internship_id) || null,
    }));

    const stages: Record<string, number> = {
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      interview_scheduled: 0,
      offered: 0,
      rejected: 0,
    };

    applications.forEach((a) => {
      if (stages[a.status] !== undefined) {
        stages[a.status]++;
      }
    });

    return res.json({
      success: true,
      company: company.toJSON(),
      metrics: {
        activeListings: internships.filter((i) => i.status === 'published').length,
        totalApplicants: applications.length,
        scheduledInterviews: interviews.filter((i: any) => ['scheduled', 'confirmed'].includes(i.status || '')).length,
        offersExtended: stages.offered,
      },
      pipelineStages: stages,
      recentApplicants,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getRecruiterApplicants(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const company = await getRecruiterCompany(userId!);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const { internship_id, status } = req.query;
    const internships = await Internship.find({ company_id: company.id });
    const internshipIds = internships.map((i) => i.id);

    const filter: any = {
      internship_id: { $in: internshipIds },
    };

    if (internship_id && typeof internship_id === 'string' && internshipIds.includes(internship_id)) {
      filter.internship_id = internship_id;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await Application.find(filter).sort({ applied_at: -1 });

    const studentIds = [...new Set(applications.map((a) => a.student_id))];
    const students = await User.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s.id, s.toJSON()]));
    const internshipMap = new Map(internships.map((i) => [i.id, i.toJSON()]));

    const result = applications.map((a) => ({
      ...a.toJSON(),
      student: studentMap.get(a.student_id) || null,
      internship: internshipMap.get(a.internship_id) || null,
    }));

    return res.json({
      success: true,
      applicants: result,
      count: result.length,
      internships: internships.map((i) => ({ id: i.id, title: i.title })),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getRecruiterApplicantDetail(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const [internship, student, skills, projects] = await Promise.all([
      Internship.findById(application.internship_id),
      User.findById(application.student_id),
      StudentSkill.find({ student_id: application.student_id }),
      StudentProject.find({ student_id: application.student_id }),
    ]);

    return res.json({
      success: true,
      application: application.toJSON(),
      internship: internship?.toJSON() || null,
      student: student
        ? {
            ...student.toJSON(),
            skills: skills.map((s) => s.toJSON()),
            projects: projects.map((p) => p.toJSON()),
          }
        : null,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getRecruiterPipeline(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const company = await getRecruiterCompany(userId!);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const internships = await Internship.find({ company_id: company.id });
    const internshipIds = internships.map((i) => i.id);

    const applications = await Application.find({ internship_id: { $in: internshipIds } }).sort({ match_score: -1 });

    const studentIds = applications.map((a) => a.student_id);
    const students = await User.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s.id, s.toJSON()]));
    const internshipMap = new Map(internships.map((i) => [i.id, i.toJSON()]));

    const pipeline: Record<string, any[]> = {
      applied: [],
      reviewing: [],
      shortlisted: [],
      interview_scheduled: [],
      offered: [],
      rejected: [],
    };

    applications.forEach((a) => {
      const item = {
        ...a.toJSON(),
        student: studentMap.get(a.student_id) || null,
        internship: internshipMap.get(a.internship_id) || null,
      };
      if (pipeline[a.status]) {
        pipeline[a.status].push(item);
      }
    });

    return res.json({
      success: true,
      pipeline,
      summary: {
        total: applications.length,
        shortlisted: pipeline.shortlisted.length,
        interviews: pipeline.interview_scheduled.length,
        offers: pipeline.offered.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCompanyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const company = await getRecruiterCompany(userId!);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    return res.json({ success: true, company: company.toJSON() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCompanyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const company = await getRecruiterCompany(userId!);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const allowed = ['name', 'website', 'industry', 'company_size', 'description', 'location', 'logo_url'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (company as any)[field] = req.body[field];
      }
    });

    await company.save();
    return res.json({ success: true, company: company.toJSON(), message: 'Company profile updated.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
