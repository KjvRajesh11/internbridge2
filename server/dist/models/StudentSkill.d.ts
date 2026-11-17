import mongoose from 'mongoose';
export interface IStudentSkill {
    _id: string;
    id: string;
    student_id: string;
    skill_name: string;
    proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verified: boolean;
    created_at: Date;
}
export declare const StudentSkill: mongoose.Model<IStudentSkill, {}, {}, {}, mongoose.Document<unknown, {}, IStudentSkill, {}, {}> & IStudentSkill & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
