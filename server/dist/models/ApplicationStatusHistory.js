import mongoose, { Schema } from 'mongoose';
const applicationStatusHistorySchema = new Schema({
    _id: { type: String, required: true },
    application_id: { type: String, required: true, ref: 'Application' },
    previous_status: { type: String },
    from_status: { type: String },
    new_status: { type: String },
    to_status: { type: String },
    changed_by: { type: String, required: true, ref: 'User' },
    change_timestamp: { type: Date, default: Date.now },
    changed_at: { type: Date, default: Date.now },
    reason: { type: String },
    note: { type: String },
}, {
    timestamps: false,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            ret.id = ret._id;
            ret.new_status = ret.new_status || ret.to_status;
            ret.to_status = ret.to_status || ret.new_status;
            ret.previous_status = ret.previous_status || ret.from_status;
            ret.from_status = ret.from_status || ret.previous_status;
            ret.reason = ret.reason || ret.note;
            ret.note = ret.note || ret.reason;
            ret.changed_at = ret.changed_at || ret.change_timestamp;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
applicationStatusHistorySchema.index({ application_id: 1, change_timestamp: -1 });
export const ApplicationStatusHistory = mongoose.model('ApplicationStatusHistory', applicationStatusHistorySchema);
