import mongoose from 'mongoose';
export interface ICompany {
    _id: string;
    id: string;
    name: string;
    description: string;
    website?: string;
    industry: string;
    location: string;
    logo_url?: string;
    status: 'active' | 'pending_verification' | 'suspended';
    created_at: Date;
    updated_at: Date;
}
export declare const Company: mongoose.Model<ICompany, {}, {}, {}, mongoose.Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
