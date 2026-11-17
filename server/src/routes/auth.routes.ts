import { Router } from 'express';
import {
  getCurrentUser,
  switchUser,
  registerStudent,
  registerRecruiter,
  login,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.post('/switch-user', switchUser);
router.post('/register/student', registerStudent);
router.post('/register/recruiter', registerRecruiter);
router.post('/login', login);
router.post('/logout', logout);

export default router;
