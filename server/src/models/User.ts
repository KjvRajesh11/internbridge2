import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@shared/types/index.js';

export interface IUser {
  _id: string;
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  education?: string;
  degree?: string;
  department?: string;
  graduation_year?: number;
  gpa?: number;
  location?: string;
  professional_summary?: string;
  preferences?: Record<string, unknown>;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], required: true },
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    phone: { type: String },
    education: { type: String },
    degree: { type: String },
    department: { type: String },
    graduation_year: { type: Number },
    gpa: { type: Number },
    location: { type: String },
    professional_summary: { type: String },
    preferences: { type: Schema.Types.Mixed, default: {} },
    avatar_url: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

userSchema.virtual('id').get(function () {
  return this._id;
});

export const User = mongoose.model<IUser>('User', userSchema);
