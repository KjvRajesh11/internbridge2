import mongoose from 'mongoose';
export interface INotification {
    _id: string;
    id?: string;
    user_id: string;
    recipient_id?: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    read?: boolean;
    created_at?: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
