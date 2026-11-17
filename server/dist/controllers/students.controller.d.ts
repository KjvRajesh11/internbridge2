import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getStudentProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateStudentProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStudentPortfolio(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addStudentSkill(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addStudentProject(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStudentDashboard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
