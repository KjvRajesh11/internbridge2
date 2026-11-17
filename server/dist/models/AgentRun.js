import mongoose, { Schema } from 'mongoose';
const agentRunSchema = new Schema({
    _id: { type: String, required: true },
    user_id: { type: String, required: true, ref: 'User' },
    agent_type: {
        type: String,
        enum: [
            'hunter_agent',
            'personalization_agent',
            'execution_agent',
            'guard_agent',
            'career_ops_agent',
        ],
        required: true,
    },
    status: {
        type: String,
        enum: ['running', 'completed', 'failed'],
        default: 'running',
    },
    trigger_type: {
        type: String,
        enum: ['manual', 'auto', 'scheduled'],
        default: 'manual',
    },
    input_summary: { type: Schema.Types.Mixed, default: {} },
    output_summary: { type: Schema.Types.Mixed, default: {} },
    error_message: { type: String },
    started_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
}, {
    timestamps: false,
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
agentRunSchema.index({ user_id: 1, started_at: -1 });
agentRunSchema.index({ agent_type: 1 });
agentRunSchema.virtual('id').get(function () {
    return this._id;
});
export const AgentRun = mongoose.model('AgentRun', agentRunSchema);
