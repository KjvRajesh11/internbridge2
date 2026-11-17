import mongoose from 'mongoose';
export interface IStudentCertification {
    _id: string;
    id: string;
    student_id: string;
    name: string;
    issuing_org: string;
    issue_date?: string;
    credential_url?: string;
    created_at: Date;
}
export declare const StudentCertification: mongoose.Model<IStudentCertification, {}, {}, {}, mongoose.Document<unknown, {}, IStudentCertification, {}, {}> & IStudentCertification & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
