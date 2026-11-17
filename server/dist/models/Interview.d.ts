import mongoose from 'mongoose';
import { InterviewMode, InterviewStatus } from '@shared/types/index.js';
export interface IInterview {
    _id: string;
    id?: string;
    application_id: string;
    interviewer_id?: string;
    student_id: string;
    internship_id: string;
    start_time?: Date;
    end_time?: Date;
    scheduled_at?: Date;
    duration_minutes?: number;
    timezone?: string;
    interview_mode?: InterviewMode;
    meeting_url?: string;
    meeting_link?: string;
    interview_type?: string;
    interview_status?: InterviewStatus;
    status?: string;
    candidate_instructions?: string;
    preparation_notes?: string;
    created_at?: Date;
    updated_at?: Date;
}
export declare const Interview: mongoose.Model<IInterview, {}, {}, {}, mongoose.Document<unknown, {}, IInterview, {}, {}> & IInterview & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
