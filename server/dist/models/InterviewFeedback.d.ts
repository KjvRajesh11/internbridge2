import mongoose from 'mongoose';
export interface IInterviewFeedback {
    _id: string;
    id: string;
    interview_id: string;
    application_id: string;
    evaluator_id: string;
    technical_rating: number;
    communication_rating: number;
    problem_solving_rating: number;
    overall_rating: number;
    notes: string;
    recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire';
    created_at: Date;
}
export declare const InterviewFeedback: mongoose.Model<IInterviewFeedback, {}, {}, {}, mongoose.Document<unknown, {}, IInterviewFeedback, {}, {}> & IInterviewFeedback & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
