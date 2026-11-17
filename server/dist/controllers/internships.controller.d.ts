import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getInternships(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getInternshipById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createInternship(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateInternship(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteInternship(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
