import mongoose, { Schema, Document } from 'mongoose';

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

const studentCertificationSchema = new Schema<IStudentCertification>(
  {
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true, trim: true },
    issuing_org: { type: String, required: true },
    issue_date: { type: String },
    credential_url: { type: String },
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

studentCertificationSchema.index({ student_id: 1 });

studentCertificationSchema.virtual('id').get(function () {
  return this._id;
});

export const StudentCertification = mongoose.model<IStudentCertification>(
  'StudentCertification',
  studentCertificationSchema
);
