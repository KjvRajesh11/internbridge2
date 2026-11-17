import mongoose, { Schema, Document } from 'mongoose';

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

const studentProjectSchema = new Schema<IStudentProject>(
  {
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    repo_url: { type: String },
    live_url: { type: String },
    featured: { type: Boolean, default: false },
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

studentProjectSchema.index({ student_id: 1 });

studentProjectSchema.virtual('id').get(function () {
  return this._id;
});

export const StudentProject = mongoose.model<IStudentProject>('StudentProject', studentProjectSchema);
