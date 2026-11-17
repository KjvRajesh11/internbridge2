import mongoose from 'mongoose';
import { WorkMode, InternshipStatus, EligibilityRules } from '@shared/types/index.js';
export interface IInternship {
    _id: string;
    id: string;
    company_id: string;
    created_by: string;
    title: string;
    description: string;
    responsibilities: string;
    required_skills: string[];
    preferred_skills: string[];
    eligibility_rules: EligibilityRules;
    minimum_gpa: number;
    accepted_graduation_years: number[];
    location: string;
    work_mode: WorkMode;
    duration: string;
    stipend: string;
    application_deadline: Date;
    status: InternshipStatus;
    openings_count: number;
    created_at: Date;
    updated_at: Date;
}
export declare const Internship: mongoose.Model<IInternship, {}, {}, {}, mongoose.Document<unknown, {}, IInternship, {}, {}> & IInternship & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
