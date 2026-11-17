import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt.js';
import { UserRole } from '@shared/types/index.js';
export interface AuthenticatedRequest extends Request {
    user?: any;
    tokenPayload?: TokenPayload;
}
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
export declare const requireAuth: typeof authenticate;
export declare function requireRole(...allowedRoles: (UserRole | string)[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
