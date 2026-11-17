import mongoose from 'mongoose';
export interface IStudentDocument {
    _id: string;
    id: string;
    student_id: string;
    document_type: 'resume' | 'portfolio' | 'transcript' | 'other';
    file_name: string;
    file_url: string;
    file_size?: number;
    parsed_content?: string;
    is_primary: boolean;
    created_at: Date;
}
export declare const StudentDocument: mongoose.Model<IStudentDocument, {}, {}, {}, mongoose.Document<unknown, {}, IStudentDocument, {}, {}> & IStudentDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
