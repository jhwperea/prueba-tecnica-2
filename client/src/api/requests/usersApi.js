import httpCliente from '../services/httpCliente';

/**
 * Obtener lista de usuarios (con filtro opcional por perfil)
 * @param {{ proId?: number }} params
 */
export const getUsersAPI = (params) =>
  httpCliente.get('security/users/get_users', params);

/**
 * Obtener usuarios filtrados por permiso
 * @param {{ perId: number | string }} params
 */
export const getUserByPermisionAPI = (params) =>
  httpCliente.post('security/users/get_users_permision', params);

/**
 * Conteo de usuarios agrupado por perfil
 * @param {{ idusuario: number }} params
 */
export const countUsersAPI = (params) =>
  httpCliente.get('security/users/count_users', params);

/**
 * Paginación de usuarios con filtros
 * @param {{ useId, proId, name, lastName, email, phone, identification, username, staId, rows, first, sortField, sortOrder }} params
 */
export const paginationUsersAPI = (params) =>
  httpCliente.post('security/users/list_users', params);

/**
 * Eliminar usuario (soft delete — cambia sta_id a 3)
 * @param {{ useId: number, updatedBy: string }} params
 */
export const deleteUserAPI = (params) =>
  httpCliente.put('security/users/delete_user', params);

/**
 * Crear o editar usuario.
 * Pasa un FormData cuando incluyas foto (multipart), u objeto normal si no.
 * El header Content-Type multipart se setea automáticamente con FormData.
 * @param {FormData | object} params
 */
export const saveUserAPI = (params) => {
  const isFormData = params instanceof FormData;
  return httpCliente.post('security/users/save_user', params, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

/**
 * Guardar cambios desde el perfil propio del usuario (sin foto)
 * @param {object} params
 */
export const saveUserProfileAPI = (params) =>
  httpCliente.post('security/users/save_user', params);

/**
 * Actualizar solo la foto de un usuario
 * @param {{ useId: number, usePhoto: string }} params
 */
export const updateUserPhotoAPI = (params) =>
  httpCliente.post('security/users/update_user_photo', params);

/**
 * Actualizar permisos de un usuario
 * @param {{ useId: number, permissions: number[] }} params
 */
export const updateUserPermissionsAPI = (params) =>
  httpCliente.post('security/permissions/update_permissions_user', params);

/**
 * Guardar novedad de usuario (crea o edita según novId)
 */
export const saveNewnessUserAPI = (params) =>
  httpCliente.post('security/users/save_newness_user', params);

/**
 * Eliminar novedad de usuario (soft delete)
 */
export const deleteNewnessUserAPI = (params) =>
  httpCliente.post('security/users/delete_newness_user', params);

/**
 * Obtener novedades activas de un usuario
 */
export const getNewnessUserAPI = (params) =>
  httpCliente.post('security/users/get_newness_user', params);

/**
 * Obtener información básica del usuario autenticado
 * @param {{ useId: number }} params (query params)
 */
export const getBasicInformationAPI = (params) =>
  httpCliente.get('auth/get_basic_information', params);

/**
 * Actualizar datos de la cuenta del usuario autenticado
 * @param {{ name: string, username: string, email: string, useId: number }} params
 */
export const updateAccountAPI = (params) =>
  httpCliente.put('auth/update_account', params);

/**
 * Actualizar contraseña del usuario autenticado
 * @param {{ currentPassword: string, newPassword: string, useId: number }} params
 */
export const updatePasswordAPI = (params) =>
  httpCliente.put('auth/update_password', params);