import mongoose from 'mongoose';
export interface IStudentProject {
    _id: string;
    id: string;
    student_id: string;
    title: string;
    description: string;
    technologies: string[];
    repo_url?: string;
    live_url?: string;
    featured: boolean;
    created_at: Date;
}
export declare const StudentProject: mongoose.Model<IStudentProject, {}, {}, {}, mongoose.Document<unknown, {}, IStudentProject, {}, {}> & IStudentProject & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
