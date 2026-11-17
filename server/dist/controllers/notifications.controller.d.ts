import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare function getNotifications(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function markAllNotificationsAsRead(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
