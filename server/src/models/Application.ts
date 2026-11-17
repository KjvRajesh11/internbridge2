import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus, MatchAnalysis } from '@shared/types/index.js';

export interface IApplication {
  _id: string;
  id: string;
  student_id: string;
  internship_id: string;
  status: ApplicationStatus;
  resume_url?: string;
  answers: Record<string, string>;
  cover_letter?: string;
  match_score?: number;
  match_analysis?: MatchAnalysis;
  submission_timestamp: Date;
  updated_at: Date;
  final_decision_timestamp?: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    internship_id: { type: String, required: true, ref: 'Internship' },
    status: {
      type: String,
      enum: [
        'applied',
        'under_review',
        'shortlisted',
        'interview_scheduled',
        'selected',
        'rejected',
        'withdrawn',
      ],
      default: 'applied',
    },
    resume_url: { type: String },
    answers: { type: Schema.Types.Mixed, default: {} },
    cover_letter: { type: String },
    match_score: { type: Number },
    match_analysis: { type: Schema.Types.Mixed, default: {} },
    submission_timestamp: { type: Date, default: Date.now },
    final_decision_timestamp: { type: Date },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
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

// Non-negotiable key business rule: A student cannot apply to the same internship more than once
applicationSchema.index(
  { student_id: 1, internship_id: 1 },
  { unique: true, name: 'unique_student_internship_application' }
);

applicationSchema.index({ status: 1 });
applicationSchema.index({ internship_id: 1 });
applicationSchema.index({ student_id: 1 });

applicationSchema.virtual('id').get(function () {
  return this._id;
});

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
