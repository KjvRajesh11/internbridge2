import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyMember {
  _id: string;
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'recruiter' | 'hiring_manager';
  membership_status: 'active' | 'invited' | 'inactive';
  created_at: Date;
}

const companyMemberSchema = new Schema<ICompanyMember>(
  {
    _id: { type: String, required: true },
    company_id: { type: String, required: true, ref: 'Company' },
    user_id: { type: String, required: true, ref: 'User' },
    role: {
      type: String,
      enum: ['owner', 'admin', 'recruiter', 'hiring_manager'],
      default: 'recruiter',
    },
    membership_status: {
      type: String,
      enum: ['active', 'invited', 'inactive'],
      default: 'active',
    },
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

companyMemberSchema.index({ company_id: 1, user_id: 1 }, { unique: true });

companyMemberSchema.virtual('id').get(function () {
  return this._id;
});

export const CompanyMember = mongoose.model<ICompanyMember>('CompanyMember', companyMemberSchema);
