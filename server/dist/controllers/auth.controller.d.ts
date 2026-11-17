import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function switchUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function registerStudent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function registerRecruiter(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
