import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  User,
  StudentSkill,
  StudentProject,
  StudentCertification,
  StudentPreferences,
  StudentDocument,
  Application,
  Internship,
  Company,
  Interview,
  Notification,
} from '../models/index.js';
import { HunterAgent } from '../services/agents/hunter-agent.js';

export async function getStudentProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [user, skills, projects, certifications, preferences, documents] = await Promise.all([
      User.findById(userId),
      StudentSkill.find({ student_id: userId }),
      StudentProject.find({ student_id: userId }),
      StudentCertification.find({ student_id: userId }),
      StudentPreferences.findOne({ student_id: userId }),
      StudentDocument.find({ student_id: userId }),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      profile: {
        ...user.toJSON(),
        skills: skills.map((s) => s.toJSON()),
        projects: projects.map((p) => p.toJSON()),
        certifications: certifications.map((c) => c.toJSON()),
        preferences: preferences ? preferences.toJSON() : null,
        documents: documents.map((d) => d.toJSON()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateStudentProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const allowed = [
      'full_name',
      'headline',
      'bio',
      'phone',
      'location',
      'college',
      'degree',
      'graduation_year',
      'gpa',
      'linkedin_url',
      'github_url',
      'portfolio_url',
      'avatar_url',
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    await user.save();

    return res.json({
      success: true,
      profile: user.toJSON(),
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getStudentPortfolio(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [skills, projects, certifications, documents] = await Promise.all([
      StudentSkill.find({ student_id: userId }),
      StudentProject.find({ student_id: userId }),
      StudentCertification.find({ student_id: userId }),
      StudentDocument.find({ student_id: userId }),
    ]);

    return res.json({
      success: true,
      portfolio: {
        skills: skills.map((s) => s.toJSON()),
        projects: projects.map((p) => p.toJSON()),
        certifications: certifications.map((c) => c.toJSON()),
        documents: documents.map((d) => d.toJSON()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addStudentSkill(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { skill_name, proficiency, years_of_experience, is_primary } = req.body;

    if (!skill_name) {
      return res.status(400).json({ success: false, error: 'Skill name is required.' });
    }

    const id = 'sk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const skill = await StudentSkill.create({
      _id: id,
      student_id: userId,
      skill_name: skill_name.trim(),
      proficiency: proficiency || 'intermediate',
      years_of_experience: years_of_experience || 1,
      is_primary: Boolean(is_primary),
      is_verified: true,
    });

    return res.status(201).json({ success: true, skill: skill.toJSON() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addStudentProject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { title, description, role, technologies, repo_url, live_url, highlights } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Project title is required.' });
    }

    const id = 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const project = await StudentProject.create({
      _id: id,
      student_id: userId,
      title: title.trim(),
      description: description || '',
      role: role || 'Lead Developer',
      technologies: Array.isArray(technologies) ? technologies : [],
      repo_url: repo_url || '',
      live_url: live_url || '',
      highlights: Array.isArray(highlights) ? highlights : [],
      is_featured: true,
    });

    return res.status(201).json({ success: true, project: project.toJSON() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getStudentDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [applications, interviews, recommended] = await Promise.all([
      Application.find({ student_id: userId }).sort({ applied_at: -1 }),
      Interview.find({ student_id: userId }).sort({ scheduled_at: 1 }),
      HunterAgent.findMatchesForStudent(userId, 5),
    ]);

    // Populate recent applications
    const internshipIds = applications.slice(0, 5).map((a: any) => a.internship_id);
    const internships = await Internship.find({ _id: { $in: internshipIds } });
    const companies = await Company.find({ _id: { $in: internships.map((i: any) => i.company_id) } });
    const compMap = new Map(companies.map((c) => [c.id, c.toJSON()]));
    const intMap = new Map(internships.map((i) => [i.id, { ...i.toJSON(), company: compMap.get(i.company_id) }]));

    const recentApplications = applications.slice(0, 5).map((a: any) => ({
      ...a.toJSON(),
      internship: intMap.get(a.internship_id) || null,
    }));

    const activeCount = applications.filter((a: any) => !['rejected', 'withdrawn'].includes(a.status)).length;
    const interviewCount = interviews.filter((i: any) => ['scheduled', 'confirmed'].includes(i.status || '')).length;
    const offerCount = applications.filter((a: any) => a.status === 'offered').length;

    const avgScore =
      applications.length > 0
        ? Math.round(applications.reduce((acc: number, a: any) => acc + (a.match_score || 0), 0) / applications.length)
        : 88;

    return res.json({
      success: true,
      metrics: {
        totalApplications: applications.length,
        activeApplications: activeCount,
        interviewsScheduled: interviewCount,
        offersReceived: offerCount,
        averageMatchScore: avgScore,
      },
      recentApplications,
      upcomingInterviews: interviews.slice(0, 3).map((i: any) => i.toJSON()),
      recommendedOpportunities: recommended,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
