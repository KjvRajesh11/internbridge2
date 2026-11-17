import mongoose, { Schema, Document } from 'mongoose';
import { AgentType } from '@shared/types/index.js';

export interface IAgentRun {
  _id: string;
  id: string;
  user_id: string;
  agent_type: AgentType;
  status: 'running' | 'completed' | 'failed';
  trigger_type: 'manual' | 'auto' | 'scheduled';
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
  error_message?: string;
  started_at: Date;
  completed_at?: Date;
}

const agentRunSchema = new Schema<IAgentRun>(
  {
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
  },
  {
    timestamps: false,
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

agentRunSchema.index({ user_id: 1, started_at: -1 });
agentRunSchema.index({ agent_type: 1 });

agentRunSchema.virtual('id').get(function () {
  return this._id;
});

export const AgentRun = mongoose.model<IAgentRun>('AgentRun', agentRunSchema);
