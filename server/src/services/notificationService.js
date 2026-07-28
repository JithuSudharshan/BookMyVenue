import notificationRepository from '../repositories/notificationRepository.js';
import { getIo } from '../config/socket.js';
import Admin from '../models/adminModel.js';

class NotificationService {
  /**
   * Sends a persistent notification (Saved to DB and emitted via WebSockets)
   */
  async sendNotification({ recipient, title, message, type = 'INFO', link = null, metadata = {} }) {
    if (!recipient) throw new Error('Recipient is required to send a notification');

    // 1. Save to Database
    const notificationData = { recipient, title, message, type, link, metadata };
    const savedNotification = await notificationRepository.create(notificationData);

    // 2. Emit real-time event to the specific user's socket room
    try {
      const io = getIo();
      io.to(recipient.toString()).emit('new_notification', savedNotification);
    } catch (error) {
      console.error('Failed to emit socket event for notification:', error.message);
      // We don't throw here because the notification is safely in the DB.
      // If the user connects later, they will fetch it.
    }

    return savedNotification;
  }

  /**
   * Broadcasts a notification to all active admins
   */
  async notifyAdmins({ title, message, type = 'INFO', link = null, metadata = {} }) {
    try {
      const admins = await Admin.find({ status: 'active' }).select('_id');
      const notifications = admins.map(admin => 
        this.sendNotification({
          recipient: admin._id,
          title,
          message,
          type,
          link,
          metadata
        })
      );
      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  async getUserNotifications(userId, limit = 50, skip = 0) {
    const notifications = await notificationRepository.findByRecipientId(userId, limit, skip);
    const unreadCount = await notificationRepository.countUnread(userId);
    return { notifications, unreadCount };
  }

  async markAsRead(notificationId, userId) {
    const updated = await notificationRepository.markAsRead(notificationId, userId);
    
    // Broadcast to other tabs the user might have open
    try {
      const io = getIo();
      if (updated) {
        io.to(userId.toString()).emit('notification_read', { notificationId });
      }
    } catch(err) {
      console.error('Socket emit failed on markAsRead:', err.message);
    }

    return updated;
  }

  async markAllAsRead(userId) {
    const result = await notificationRepository.markAllAsRead(userId);
    
    // Broadcast to other tabs
    try {
      const io = getIo();
      io.to(userId.toString()).emit('all_notifications_read');
    } catch(err) {
      console.error('Socket emit failed on markAllAsRead:', err.message);
    }

    return result;
  }
}

export default new NotificationService();
