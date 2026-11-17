import mongoose, { Schema } from 'mongoose';
const internshipSchema = new Schema({
    _id: { type: String, required: true },
    company_id: { type: String, required: true, ref: 'Company' },
    created_by: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    responsibilities: { type: String, default: '' },
    required_skills: { type: [String], default: [] },
    preferred_skills: { type: [String], default: [] },
    eligibility_rules: {
        min_gpa: { type: Number },
        allowed_degrees: { type: [String], default: [] },
        allowed_years: { type: [Number], default: [] },
        required_department: { type: [String], default: [] },
    },
    minimum_gpa: { type: Number, default: 0 },
    accepted_graduation_years: { type: [Number], default: [] },
    location: { type: String, required: true },
    work_mode: {
        type: String,
        enum: ['remote', 'hybrid', 'in-office'],
        default: 'remote',
    },
    duration: { type: String, required: true },
    stipend: { type: String, required: true },
    application_deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed', 'archived'],
        default: 'published',
    },
    openings_count: { type: Number, default: 1 },
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
internshipSchema.index({ status: 1, application_deadline: 1 });
internshipSchema.index({ company_id: 1 });
internshipSchema.virtual('id').get(function () {
    return this._id;
});
export const Internship = mongoose.model('Internship', internshipSchema);
