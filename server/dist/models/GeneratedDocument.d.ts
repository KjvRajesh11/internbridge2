import mongoose from 'mongoose';
export interface IGeneratedDocument {
    _id: string;
    id: string;
    student_id: string;
    application_id?: string;
    doc_type: 'cover_letter' | 'tailored_resume' | 'qa_answers' | 'prep_sheet';
    title: string;
    content: string;
    approved: boolean;
    created_at: Date;
}
export declare const GeneratedDocument: mongoose.Model<IGeneratedDocument, {}, {}, {}, mongoose.Document<unknown, {}, IGeneratedDocument, {}, {}> & IGeneratedDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
