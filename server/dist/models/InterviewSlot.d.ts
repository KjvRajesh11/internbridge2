import mongoose from 'mongoose';
export interface IInterviewSlot {
    _id: string;
    id: string;
    recruiter_id: string;
    company_id: string;
    start_time: Date;
    end_time: Date;
    timezone: string;
    is_booked: boolean;
    booked_by_application_id?: string;
    created_at: Date;
}
export declare const InterviewSlot: mongoose.Model<IInterviewSlot, {}, {}, {}, mongoose.Document<unknown, {}, IInterviewSlot, {}, {}> & IInterviewSlot & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
