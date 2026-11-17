import mongoose from 'mongoose';
import { WorkMode, AutoApplySettings } from '@shared/types/index.js';
export interface IStudentPreferences {
    _id: string;
    id: string;
    student_id: string;
    target_roles: string[];
    preferred_skills: string[];
    preferred_locations: string[];
    work_mode_preference: WorkMode[];
    min_stipend?: string;
    max_duration_months?: number;
    auto_apply_enabled: boolean;
    auto_apply_settings: AutoApplySettings;
    notification_preferences: {
        email: boolean;
        in_app: boolean;
    };
    updated_at: Date;
}
export declare const StudentPreferences: mongoose.Model<IStudentPreferences, {}, {}, {}, mongoose.Document<unknown, {}, IStudentPreferences, {}, {}> & IStudentPreferences & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
