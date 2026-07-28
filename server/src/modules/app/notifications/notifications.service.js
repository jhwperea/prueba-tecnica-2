import {
  getConnection,
  releaseConnection,
  executeQuery,
} from '../../../common/configs/db.config.js';
import { getIO } from '../../../common/configs/socket.manager.js';

export const getNotificationCount = async ({ userId }) => {
  let connection = null;
  try {
    connection = await getConnection();
    const [result] = await executeQuery(
      'SELECT COUNT(not_id) AS tot FROM tbl_notifications WHERE use_id = ? AND not_is_read = 0',
      [Number(userId)],
      connection,
    );
    return result?.tot ?? 0;
  } finally {
    releaseConnection(connection);
  }
};

export const listNotifications = async ({ userId, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  if (!userId || isNaN(limit) || isNaN(offset)) {
    throw new Error('Parámetros no válidos');
  }

  let connection = null;
  try {
    connection = await getConnection();

    const notifications = await executeQuery(
      `SELECT * FROM tbl_notifications
       WHERE use_id = ?
       ORDER BY not_created_at DESC
       LIMIT ${+limit} OFFSET ${+offset}`,
      [userId],
      connection,
    );

    return notifications.map((n) => ({
      ...n,
      not_data: n.not_data ? (typeof n.not_data === 'string' ? JSON.parse(n.not_data) : n.not_data) : null,
    }));
  } finally {
    releaseConnection(connection);
  }
};

export const markAllAsRead = async ({ userId }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await executeQuery(
      `UPDATE tbl_notifications
       SET not_is_read = 1, not_read_at = CURRENT_TIMESTAMP, not_updated_at = CURRENT_TIMESTAMP
       WHERE use_id = ? AND not_is_read = 0`,
      [userId],
      connection,
    );
  } finally {
    releaseConnection(connection);
  }
};

export const markAsRead = async ({ notificationId }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await executeQuery(
      `UPDATE tbl_notifications
       SET not_is_read = 1, not_read_at = CURRENT_TIMESTAMP, not_updated_at = CURRENT_TIMESTAMP
       WHERE not_id = ?`,
      [notificationId],
      connection,
    );
  } finally {
    releaseConnection(connection);
  }
};

export const insertNotification = async ({
  userId,
  priority = 'medium',
  title,
  message,
  type = 'info',
  module = null,
  action = null,
  data = null,
  connection,
}) => {
  if (!userId || !connection) return null;

  try {
    const io = getIO();

    const result = await executeQuery(
      `INSERT INTO tbl_notifications
        (use_id, not_priority, not_title, not_message, not_type, not_module, not_action, not_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, priority, title || 'Notificación', message || '', type, module, action, data ? JSON.stringify(data) : null],
      connection,
    );

    const notification = {
      not_id: result.insertId,
      use_id: userId,
      not_priority: priority,
      not_title: title,
      not_message: message,
      not_type: type,
      not_module: module,
      not_action: action,
      not_data: data,
      not_created_at: new Date(),
      not_is_read: 0,
    };

    try {
      io.to(`user:${String(userId)}`).emit('newNotification', notification);
    } catch (socketErr) {
      console.error(`[notifications] Error emitiendo socket a usuario ${userId}:`, socketErr);
    }

    return notification;
  } catch (err) {
    console.error('[notifications] Error en insertNotification:', err);
    return null;
  }
};
