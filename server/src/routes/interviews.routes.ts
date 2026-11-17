import { Router } from 'express';
import {
  getInterviews,
  getInterviewById,
  scheduleInterview,
  getSlots,
  createSlot,
  submitInterviewFeedback,
  getInterviewPreparation,
} from '../controllers/interviews.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getInterviews);
router.get('/slots', getSlots);
router.post('/slots', createSlot);
router.post('/schedule', scheduleInterview);
router.get('/:id', getInterviewById);
router.post('/:id/feedback', submitInterviewFeedback);
router.get('/:id/preparation', getInterviewPreparation);

export default router;
