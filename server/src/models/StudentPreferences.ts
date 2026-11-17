import mongoose, { Schema, Document } from 'mongoose';
import { WorkMode, AutoApplySettings } from '@shared/types/index.js';

export interface IStudentPreferences {
  _id: string;
  id: string;
  student_id: string;
  target_roles: string[];
  preferred_skills: string[];
  preferred_locations: string[];
  work_mode_preference: WorkMode[];
  min_stipend?: string;
  max_duration_months?: number;
  auto_apply_enabled: boolean;
  auto_apply_settings: AutoApplySettings;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
  };
  updated_at: Date;
}

const studentPreferencesSchema = new Schema<IStudentPreferences>(
  {
    _id: { type: String, required: true },
    student_id: { type: String, required: true, unique: true, ref: 'User' },
    target_roles: { type: [String], default: [] },
    preferred_skills: { type: [String], default: [] },
    preferred_locations: { type: [String], default: [] },
    work_mode_preference: {
      type: [String],
      default: ['remote', 'hybrid', 'in-office'],
    },
    min_stipend: { type: String },
    max_duration_months: { type: Number },
    auto_apply_enabled: { type: Boolean, default: false },
    auto_apply_settings: {
      match_threshold: { type: Number, default: 80 },
      max_weekly_apps: { type: Number, default: 5 },
      require_approval: { type: Boolean, default: true },
      allowed_modes: { type: [String], default: ['remote', 'hybrid'] },
    },
    notification_preferences: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
    },
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

studentPreferencesSchema.virtual('id').get(function () {
  return this._id;
});

export const StudentPreferences = mongoose.model<IStudentPreferences>(
  'StudentPreferences',
  studentPreferencesSchema
);
