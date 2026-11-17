import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  Interview,
  InterviewSlot,
  InterviewFeedback,
  Application,
  Internship,
  Company,
  CompanyMember,
  User,
  Notification,
} from '../models/index.js';
import { CareerOpsAgent } from '../services/agents/career-ops-agent.js';

export async function getInterviews(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const filter: any = {};
    if (user.role === 'student') {
      filter.student_id = user.id;
    } else if (user.role === 'recruiter') {
      const membership = await CompanyMember.findOne({ user_id: user.id });
      if (membership) {
        const internships = await Internship.find({ company_id: membership.company_id });
        filter.internship_id = { $in: internships.map((i) => i.id) };
      }
    }

    const interviews = await Interview.find(filter).sort({ scheduled_at: 1 });

    const internshipIds = [...new Set(interviews.map((i) => i.internship_id))];
    const studentIds = [...new Set(interviews.map((i) => i.student_id))];

    const [internships, students] = await Promise.all([
      Internship.find({ _id: { $in: internshipIds } }),
      User.find({ _id: { $in: studentIds } }),
    ]);

    const companies = await Company.find({ _id: { $in: internships.map((i) => i.company_id) } });
    const compMap = new Map(companies.map((c) => [c.id, c.toJSON()]));
    const intMap = new Map(internships.map((i) => [i.id, { ...i.toJSON(), company: compMap.get(i.company_id) }]));
    const stuMap = new Map(students.map((s) => [s.id, s.toJSON()]));

    const result = interviews.map((item) => ({
      ...item.toJSON(),
      internship: intMap.get(item.internship_id) || null,
      student: stuMap.get(item.student_id) || null,
    }));

    return res.json({ success: true, interviews: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getInterviewById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    const [internship, student, feedback] = await Promise.all([
      Internship.findById(interview.internship_id),
      User.findById(interview.student_id),
      InterviewFeedback.find({ interview_id: id }),
    ]);

    let company = null;
    if (internship) {
      company = await Company.findById(internship.company_id);
    }

    return res.json({
      success: true,
      interview: {
        ...interview.toJSON(),
        internship: internship ? { ...internship.toJSON(), company: company ? company.toJSON() : null } : null,
        student: student ? student.toJSON() : null,
        feedback: feedback.map((f) => f.toJSON()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function scheduleInterview(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only recruiters can schedule interviews.' });
    }

    const { application_id, slot_id, scheduled_at, duration_minutes, meeting_link, interview_type } = req.body;

    if (!application_id) {
      return res.status(400).json({ success: false, error: 'Application ID is required.' });
    }

    const application = await Application.findById(application_id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    // Atomic slot lock if slot_id provided
    if (slot_id) {
      const slot = await InterviewSlot.findOneAndUpdate(
        { _id: slot_id, is_booked: false },
        { is_booked: true, booked_by_application_id: application_id },
        { new: true }
      );
      if (!slot) {
        return res.status(409).json({ success: false, error: 'Selected interview slot is already booked.' });
      }
    }

    const id = 'int-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const date = scheduled_at ? new Date(scheduled_at) : new Date(Date.now() + 48 * 3600 * 1000);

    const interview = await Interview.create({
      _id: id,
      application_id: application.id,
      student_id: application.student_id,
      internship_id: application.internship_id,
      scheduled_at: date,
      duration_minutes: duration_minutes || 45,
      meeting_link: meeting_link || 'https://meet.google.com/ib-' + Math.random().toString(36).substring(2, 7),
      interview_type: interview_type || 'technical',
      status: 'scheduled',
      preparation_notes: 'Please review core project architecture and prepared STAR responses.',
    });

    // Update application status to interview_scheduled
    application.status = 'interview_scheduled';
    await application.save();

    // Notify student
    const internship = await Internship.findById(application.internship_id);
    await Notification.create({
      _id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: application.student_id,
      title: 'Interview Scheduled',
      message: `Your interview for ${internship?.title || 'internship'} is set for ${date.toLocaleString()}.`,
      type: 'interview_scheduled',
      link: `/student/interviews`,
      is_read: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully.',
      interview: interview.toJSON(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getSlots(req: AuthenticatedRequest, res: Response) {
  try {
    const { recruiter_id, is_booked } = req.query;
    const filter: any = {};
    if (recruiter_id) filter.recruiter_id = recruiter_id;
    if (is_booked !== undefined) filter.is_booked = is_booked === 'true';

    const slots = await InterviewSlot.find(filter).sort({ start_time: 1 });
    return res.json({ success: true, slots: slots.map((s) => s.toJSON()) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createSlot(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user || user.role !== 'recruiter') {
      return res.status(403).json({ success: false, error: 'Only recruiters can create interview slots.' });
    }

    const { start_time, end_time } = req.body;
    if (!start_time || !end_time) {
      return res.status(400).json({ success: false, error: 'Start and end times are required.' });
    }

    const id = 'slot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const slot = await InterviewSlot.create({
      _id: id,
      recruiter_id: user.id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      is_booked: false,
    });

    return res.status(201).json({ success: true, slot: slot.toJSON() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitInterviewFeedback(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { rating, recommendation, feedback_text, rubrics } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found.' });
    }

    const fbId = 'fb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const feedback = await InterviewFeedback.create({
      _id: fbId,
      interview_id: id,
      interviewer_id: user?.id,
      rating: Number(rating) || 4,
      recommendation: recommendation || 'strong_hire',
      feedback_text: feedback_text || '',
      rubrics: rubrics || {},
      submitted_at: new Date(),
    });

    interview.status = 'completed';
    await interview.save();

    return res.status(201).json({ success: true, feedback: feedback.toJSON() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getInterviewPreparation(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found.' });
    }

    const prep = await CareerOpsAgent.generateInterviewPrepPack(interview.student_id, interview.internship_id);
    return res.json({ success: true, preparation: prep });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
