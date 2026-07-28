import express from 'express';
import { verifyToken } from '../../../common/middlewares/authjwt.middleware.js';
import {
  getNotificationCountController,
  listNotificationsController,
  markAllAsReadController,
  markAsReadController,
} from './notifications.controller.js';

const notificationsRoutes = express.Router();

notificationsRoutes.get(
  '/get_notification_count',
  verifyToken,
  getNotificationCountController,
);

notificationsRoutes.post(
  '/pagination_notifications',
  verifyToken,
  listNotificationsController,
);

notificationsRoutes.post('/markAsRead', verifyToken, markAllAsReadController);

notificationsRoutes.post('/:id/markAsRead', verifyToken, markAsReadController);

export default notificationsRoutes;
