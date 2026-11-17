import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentSkill {
  _id: string;
  id: string;
  student_id: string;
  skill_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  created_at: Date;
}

const studentSkillSchema = new Schema<IStudentSkill>(
  {
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    skill_name: { type: String, required: true, trim: true },
    proficiency_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

studentSkillSchema.index({ student_id: 1, skill_name: 1 }, { unique: true });

studentSkillSchema.virtual('id').get(function () {
  return this._id;
});

export const StudentSkill = mongoose.model<IStudentSkill>('StudentSkill', studentSkillSchema);
