import mongoose from 'mongoose';
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
export declare const AgentRun: mongoose.Model<IAgentRun, {}, {}, {}, mongoose.Document<unknown, {}, IAgentRun, {}, {}> & IAgentRun & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
