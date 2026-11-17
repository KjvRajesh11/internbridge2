import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getApplications(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getApplicationById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function applyToInternship(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
