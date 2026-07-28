import httpCliente from '../services/httpCliente';

export const getNotificationCountAPI = (params) =>
  httpCliente.get('app/notifications/get_notification_count', params);

export const paginationNotificationsAPI = (params) =>
  httpCliente.post('app/notifications/pagination_notifications', params);

export const markAsReadAPI = (id) =>
  httpCliente.post(`app/notifications/${id}/markAsRead`);

export const markAllAsReadAPI = (params) =>
  httpCliente.post('app/notifications/markAsRead', params);
