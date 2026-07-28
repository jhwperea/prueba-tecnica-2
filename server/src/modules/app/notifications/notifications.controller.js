import {
  getNotificationCount,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from './notifications.service.js';

export const getNotificationCountController = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const count = await getNotificationCount({ userId });
    res.json(count);
  } catch (err) {
    next(err);
  }
};

export const listNotificationsController = async (req, res, next) => {
  const { userId, page = 1, limit = 10 } = req.body;
  try {
    const notifications = await listNotifications({ userId, page, limit });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markAllAsReadController = async (req, res, next) => {
  const { userId } = req.body;
  try {
    await markAllAsRead({ userId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const markAsReadController = async (req, res, next) => {
  const { id } = req.params;
  try {
    await markAsRead({ notificationId: id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
