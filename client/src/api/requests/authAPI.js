import httpCliente from '../services/httpCliente';

/**
 * Iniciar sesión
 * @param {{ usuario: string, clave: string }} params
 */
export const loginAPI = (params) =>
  httpCliente.post('/auth/login', params); // Subsanado: de 'api/auth/login' a '/auth/login'

/**
 * Solicitar recuperación de contraseña (envío de correo)
 * @param {{ useEmail: string }} params
 */
export const forgotPasswordAPI = (params) =>
  httpCliente.post('/auth/forgot_password', params);

/**
 * Restablecer contraseña con token
 * @param {{ token: string, clave: string }} params
 */
export const resetPasswordAPI = (params) =>
  httpCliente.post('/auth/reset_password', params);

/**
 * Cerrar sesión
 */
export const logoutAPI = () =>
  httpCliente.post('/auth/logout');

/**
 * Verificar token activo (útil para proteger rutas en el frontend)
 */
export const verifyTokenAPI = () =>
  httpCliente.get('/app/verify_token');

export const registerAPI = (params) =>
  httpCliente.post('/auth/register', params);

export const verifyOtpAPI = (params) =>
  httpCliente.post('/auth/verify-otp', params);

export const resendOtpAPI = (params) =>
  httpCliente.post('/auth/resend-otp', params);

export const validateCodeAPI = (params) =>
  httpCliente.post('/auth/validate_code_password', params);

export const restorePasswordAPI = (params) =>
  httpCliente.post('/auth/restore_password', params);