import { Router } from 'express';
import {
  getRecruiterDashboard,
  getRecruiterApplicants,
  getRecruiterApplicantDetail,
  getRecruiterPipeline,
  getCompanyProfile,
  updateCompanyProfile,
} from '../controllers/recruiters.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('recruiter', 'admin'));

router.get('/dashboard', getRecruiterDashboard);
router.get('/applicants', getRecruiterApplicants);
router.get('/applicants/:id', getRecruiterApplicantDetail);
router.get('/pipeline', getRecruiterPipeline);
router.get('/company', getCompanyProfile);
router.patch('/company', updateCompanyProfile);

export default router;
