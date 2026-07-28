import notificationService from '../services/notificationService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = parseInt(req.query.skip, 10) || 0;

    const data = await notificationService.getUserNotifications(userId, limit, skip);
    
    res.status(200).json({ data, message: 'Notifications retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const updated = await notificationService.markAsRead(notificationId, userId);
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ data: updated, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await notificationService.markAllAsRead(userId);
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
