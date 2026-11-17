import mongoose, { Schema } from 'mongoose';
const studentPreferencesSchema = new Schema({
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
}, {
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
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
studentPreferencesSchema.virtual('id').get(function () {
    return this._id;
});
export const StudentPreferences = mongoose.model('StudentPreferences', studentPreferencesSchema);
