import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getRecruiterDashboard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRecruiterApplicants(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRecruiterApplicantDetail(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getRecruiterPipeline(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getCompanyProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateCompanyProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
