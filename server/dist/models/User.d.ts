import mongoose from 'mongoose';
import { UserRole } from '@shared/types/index.js';
export interface IUser {
    _id: string;
    id: string;
    role: UserRole;
    full_name: string;
    email: string;
    passwordHash?: string;
    phone?: string;
    education?: string;
    degree?: string;
    department?: string;
    graduation_year?: number;
    gpa?: number;
    location?: string;
    professional_summary?: string;
    preferences?: Record<string, unknown>;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
