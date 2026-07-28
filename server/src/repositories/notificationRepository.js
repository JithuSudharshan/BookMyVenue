import Notification from '../models/Notification.js';

class NotificationRepository {
  async create(data) {
    const notification = new Notification(data);
    return await notification.save();
  }

  async findByRecipientId(recipientId, limit = 50, skip = 0) {
    return await Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countUnread(recipientId) {
    return await Notification.countDocuments({ recipient: recipientId, isRead: false });
  }

  async markAsRead(notificationId, recipientId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: recipientId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(recipientId) {
    return await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async deleteById(notificationId, recipientId) {
    return await Notification.findOneAndDelete({ _id: notificationId, recipient: recipientId });
  }
}

export default new NotificationRepository();
