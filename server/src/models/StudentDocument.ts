import mongoose, { Schema, Document } from 'mongoose';

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

const studentDocumentSchema = new Schema<IStudentDocument>(
  {
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    document_type: {
      type: String,
      enum: ['resume', 'portfolio', 'transcript', 'other'],
      default: 'resume',
    },
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    file_size: { type: Number },
    parsed_content: { type: String },
    is_primary: { type: Boolean, default: false },
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

studentDocumentSchema.index({ student_id: 1 });

studentDocumentSchema.virtual('id').get(function () {
  return this._id;
});

export const StudentDocument = mongoose.model<IStudentDocument>(
  'StudentDocument',
  studentDocumentSchema
);
