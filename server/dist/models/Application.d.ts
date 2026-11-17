import mongoose from 'mongoose';
import { ApplicationStatus, MatchAnalysis } from '@shared/types/index.js';
export interface IApplication {
    _id: string;
    id: string;
    student_id: string;
    internship_id: string;
    status: ApplicationStatus;
    resume_url?: string;
    answers: Record<string, string>;
    cover_letter?: string;
    match_score?: number;
    match_analysis?: MatchAnalysis;
    submission_timestamp: Date;
    updated_at: Date;
    final_decision_timestamp?: Date;
}
export declare const Application: mongoose.Model<IApplication, {}, {}, {}, mongoose.Document<unknown, {}, IApplication, {}, {}> & IApplication & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
