import mongoose, { Schema } from 'mongoose';
import { InterviewMode, InterviewStatus } from '@shared/types/index.js';

export interface IInterview {
  _id: string;
  id?: string;
  application_id: string;
  interviewer_id?: string;
  student_id: string;
  internship_id: string;
  start_time?: Date;
  end_time?: Date;
  scheduled_at?: Date;
  duration_minutes?: number;
  timezone?: string;
  interview_mode?: InterviewMode;
  meeting_url?: string;
  meeting_link?: string;
  interview_type?: string;
  interview_status?: InterviewStatus;
  status?: string;
  candidate_instructions?: string;
  preparation_notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    _id: { type: String, required: true },
    application_id: { type: String, required: true, ref: 'Application' },
    interviewer_id: { type: String, ref: 'User' },
    student_id: { type: String, ref: 'User' },
    internship_id: { type: String, ref: 'Internship' },
    start_time: { type: Date },
    end_time: { type: Date },
    scheduled_at: { type: Date },
    duration_minutes: { type: Number, default: 45 },
    timezone: { type: String, default: 'Asia/Kolkata' },
    interview_mode: {
      type: String,
      enum: ['video', 'in-person', 'phone'],
      default: 'video',
    },
    meeting_url: { type: String },
    meeting_link: { type: String },
    interview_type: { type: String, default: 'technical' },
    interview_status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    status: { type: String, default: 'scheduled' },
    candidate_instructions: { type: String },
    preparation_notes: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id;
        ret.status = ret.status || ret.interview_status;
        ret.meeting_link = ret.meeting_link || ret.meeting_url;
        ret.scheduled_at = ret.scheduled_at || ret.start_time;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

interviewSchema.index({ application_id: 1 });
interviewSchema.index({ student_id: 1 });
interviewSchema.index({ internship_id: 1 });
interviewSchema.index({ interviewer_id: 1, start_time: 1 });

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
