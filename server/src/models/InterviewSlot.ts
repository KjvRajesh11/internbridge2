import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSlot {
  _id: string;
  id: string;
  recruiter_id: string;
  company_id: string;
  start_time: Date;
  end_time: Date;
  timezone: string;
  is_booked: boolean;
  booked_by_application_id?: string;
  created_at: Date;
}

const interviewSlotSchema = new Schema<IInterviewSlot>(
  {
    _id: { type: String, required: true },
    recruiter_id: { type: String, required: true, ref: 'User' },
    company_id: { type: String, required: true, ref: 'Company' },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    is_booked: { type: Boolean, default: false },
    booked_by_application_id: { type: String, ref: 'Application' },
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

interviewSlotSchema.index({ recruiter_id: 1, start_time: 1 });
interviewSlotSchema.index({ company_id: 1, is_booked: 1 });

interviewSlotSchema.virtual('id').get(function () {
  return this._id;
});

export const InterviewSlot = mongoose.model<IInterviewSlot>('InterviewSlot', interviewSlotSchema);
