import { Router } from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentPortfolio,
  addStudentSkill,
  addStudentProject,
  getStudentDashboard,
} from '../controllers/students.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/profile', requireAuth, getStudentProfile);
router.patch('/profile', requireAuth, requireRole('student'), updateStudentProfile);
router.get('/portfolio', requireAuth, getStudentPortfolio);
router.post('/skills', requireAuth, requireRole('student'), addStudentSkill);
router.post('/projects', requireAuth, requireRole('student'), addStudentProject);
router.get('/dashboard', requireAuth, requireRole('student'), getStudentDashboard);

export default router;
