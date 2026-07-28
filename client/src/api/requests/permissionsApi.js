import httpCliente from '../services/httpCliente';

/**
 * Actualizar permisos de un usuario específico
 * @param {{ useId: number, permissions: number[] }} params
 */
export const updatePermissionsUserAPI = (params) =>
  httpCliente.post('security/permissions/update_permissions_user', params);

/**
 * Obtener permisos actuales de un usuario
 * @param {{ useId: number }} params
 */
export const getPermissionsUserAPI = (params) =>
  httpCliente.get('security/permissions/get_permissions_user', params);