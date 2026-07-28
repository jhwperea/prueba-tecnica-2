import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../configs/db.config.js";

/**
 * Verifica si un usuario tiene un permiso puntual (per_id) asignado.
 * El usuario con use_id = 1 se considera superadministrador (mismo criterio
 * usado en el frontend, ver contexts/authContext.jsx -> hasPermission).
 * @param {number} useId
 * @param {number} perId
 * @returns {Promise<boolean>}
 */
export const userHasPermission = async (useId, perId) => {
  if (!useId) return false;
  if (Number(useId) === 1) return true;

  let connection = null;
  try {
    connection = await getConnection();
    const rows = await executeQuery(
      `SELECT 1 FROM tbl_user_permissions WHERE use_id = ? AND per_id = ? LIMIT 1`,
      [useId, perId],
      connection
    );
    return rows.length > 0;
  } finally {
    releaseConnection(connection);
  }
};
