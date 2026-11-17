import mongoose, { Schema } from 'mongoose';
const notificationSchema = new Schema({
    _id: { type: String, required: true },
    user_id: { type: String, ref: 'User' },
    recipient_id: { type: String, ref: 'User' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    is_read: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            ret.id = ret._id;
            ret.user_id = ret.user_id || ret.recipient_id;
            ret.is_read = ret.is_read !== undefined ? ret.is_read : ret.read;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ user_id: 1, created_at: -1 });
export const Notification = mongoose.model('Notification', notificationSchema);
