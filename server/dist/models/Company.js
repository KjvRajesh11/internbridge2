import mongoose, { Schema } from 'mongoose';
const companySchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    website: { type: String },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    logo_url: { type: String },
    status: {
        type: String,
        enum: ['active', 'pending_verification', 'suspended'],
        default: 'active',
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
companySchema.virtual('id').get(function () {
    return this._id;
});
export const Company = mongoose.model('Company', companySchema);
