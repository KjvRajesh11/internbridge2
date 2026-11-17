import mongoose, { Schema } from 'mongoose';
const studentCertificationSchema = new Schema({
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true, trim: true },
    issuing_org: { type: String, required: true },
    issue_date: { type: String },
    credential_url: { type: String },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
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
studentCertificationSchema.index({ student_id: 1 });
studentCertificationSchema.virtual('id').get(function () {
    return this._id;
});
export const StudentCertification = mongoose.model('StudentCertification', studentCertificationSchema);
