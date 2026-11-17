import mongoose, { Schema } from 'mongoose';
const interviewFeedbackSchema = new Schema({
    _id: { type: String, required: true },
    interview_id: { type: String, required: true, ref: 'Interview' },
    application_id: { type: String, required: true, ref: 'Application' },
    evaluator_id: { type: String, required: true, ref: 'User' },
    technical_rating: { type: Number, required: true, min: 1, max: 5 },
    communication_rating: { type: Number, required: true, min: 1, max: 5 },
    problem_solving_rating: { type: Number, required: true, min: 1, max: 5 },
    overall_rating: { type: Number, required: true, min: 1, max: 5 },
    notes: { type: String, default: '' },
    recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'neutral', 'no_hire'],
        default: 'hire',
    },
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
interviewFeedbackSchema.index({ interview_id: 1 });
interviewFeedbackSchema.index({ application_id: 1 });
interviewFeedbackSchema.virtual('id').get(function () {
    return this._id;
});
export const InterviewFeedback = mongoose.model('InterviewFeedback', interviewFeedbackSchema);
