import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getInterviews(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getInterviewById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function scheduleInterview(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getSlots(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createSlot(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function submitInterviewFeedback(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getInterviewPreparation(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
