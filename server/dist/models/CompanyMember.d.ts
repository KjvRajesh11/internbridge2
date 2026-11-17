import mongoose from 'mongoose';
export interface ICompanyMember {
    _id: string;
    id: string;
    company_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'recruiter' | 'hiring_manager';
    membership_status: 'active' | 'invited' | 'inactive';
    created_at: Date;
}
export declare const CompanyMember: mongoose.Model<ICompanyMember, {}, {}, {}, mongoose.Document<unknown, {}, ICompanyMember, {}, {}> & ICompanyMember & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
