import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Company, CompanyMember, StudentPreferences } from '../models/index.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let company = null;
    if (user.role === 'recruiter') {
      const membership = await CompanyMember.findOne({ user_id: user.id });
      if (membership) {
        company = await Company.findById(membership.company_id);
      }
    }

    const preferences = user.role === 'student' ? await StudentPreferences.findOne({ student_id: user.id }) : null;

    const availableProfiles = await User.find({}, '_id role full_name email');

    return res.json({
      success: true,
      user: user.toJSON(),
      company: company ? company.toJSON() : null,
      preferences: preferences ? preferences.toJSON() : null,
      availableProfiles: availableProfiles.map((p) => ({
        id: p.id,
        name: p.full_name,
        role: p.role,
        email: p.email,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function switchUser(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    const token = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    res.cookie('demoUserId', user.id, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });

    return res.json({
      success: true,
      token,
      user: user.toJSON(),
      message: `Switched active session to ${user.full_name} (${user.role})`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function registerStudent(req: Request, res: Response) {
  try {
    const { email, password, full_name, education, degree, department, graduation_year, gpa } = req.body;

    if (!email || !full_name) {
      return res.status(400).json({ success: false, error: 'Email and Full Name are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);
    const id = 's-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const user = await User.create({
      _id: id,
      role: 'student',
      email: email.toLowerCase().trim(),
      passwordHash,
      full_name: full_name.trim(),
      education: education || 'Engineering College',
      degree: degree || 'B.Tech',
      department: department || 'Computer Science',
      graduation_year: graduation_year ? Number(graduation_year) : 2026,
      gpa: gpa ? Number(gpa) : 8.0,
      preferences: { work_modes: ['remote', 'hybrid'] },
    });

    await StudentPreferences.create({
      _id: 'pref-' + id,
      student_id: id,
      target_roles: ['Software Engineer', 'Full Stack Developer'],
      preferred_skills: [],
      preferred_locations: [],
      work_mode_preference: ['remote', 'hybrid'],
      auto_apply_enabled: false,
      auto_apply_settings: {
        match_threshold: 80,
        max_weekly_apps: 5,
        require_approval: true,
        allowed_modes: ['remote', 'hybrid'],
      },
      notification_preferences: { email: true, in_app: true },
    });

    const token = generateAccessToken({ userId: user.id, role: user.role, email: user.email });

    return res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      message: 'Student account created successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function registerRecruiter(req: Request, res: Response) {
  try {
    const { email, password, full_name, company_name, industry, location } = req.body;

    if (!email || !full_name || !company_name) {
      return res.status(400).json({ success: false, error: 'Email, Full Name, and Company Name are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);
    const userId = 'r-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const companyId = 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const company = await Company.create({
      _id: companyId,
      name: company_name.trim(),
      industry: industry || 'Software & Technology',
      location: location || 'Bengaluru, India',
      status: 'active',
    });

    const user = await User.create({
      _id: userId,
      role: 'recruiter',
      email: email.toLowerCase().trim(),
      passwordHash,
      full_name: full_name.trim(),
      location: location || 'Bengaluru, India',
    });

    await CompanyMember.create({
      _id: 'cm-' + userId,
      company_id: companyId,
      user_id: userId,
      role: 'admin',
      membership_status: 'active',
    });

    const token = generateAccessToken({ userId: user.id, role: user.role, email: user.email });

    return res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      company: company.toJSON(),
      message: 'Recruiter workspace created successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.passwordHash && password) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
    }

    const token = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, email: user.email });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('demoUserId', user.id, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });

    return res.json({
      success: true,
      token,
      user: user.toJSON(),
      message: 'Sign in successful.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('refreshToken');
  res.clearCookie('demoUserId');
  return res.json({ success: true, message: 'Signed out successfully.' });
}
