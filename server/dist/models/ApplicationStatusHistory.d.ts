import mongoose from 'mongoose';
import { ApplicationStatus } from '@shared/types/index.js';
export interface IApplicationStatusHistory {
    _id: string;
    id?: string;
    application_id: string;
    previous_status?: ApplicationStatus | string;
    from_status?: ApplicationStatus | string;
    new_status?: ApplicationStatus | string;
    to_status?: ApplicationStatus | string;
    changed_by: string;
    change_timestamp?: Date;
    changed_at?: Date;
    reason?: string;
    note?: string;
}
export declare const ApplicationStatusHistory: mongoose.Model<IApplicationStatusHistory, {}, {}, {}, mongoose.Document<unknown, {}, IApplicationStatusHistory, {}, {}> & IApplicationStatusHistory & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
