import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Notification } from '../models/index.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notifications = await Notification.find({ user_id: userId }).sort({ created_at: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });

    return res.json({
      success: true,
      notifications: notifications.map((n) => n.toJSON()),
      unreadCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notification.is_read = true;
    await notification.save();

    return res.json({ success: true, notification: notification.toJSON() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAllNotificationsAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await Notification.updateMany({ user_id: userId, is_read: false }, { $set: { is_read: true } });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
