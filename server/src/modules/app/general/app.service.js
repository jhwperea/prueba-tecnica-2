import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import jwt from "jsonwebtoken";

export const getMenu = async ({ per, idu }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const rowsv = await executeQuery(
      `SELECT use_pages AS ven FROM tbl_users WHERE use_id = $1 LIMIT 1`,
      [idu],
      connection
    );
    const ven = rowsv[0]?.ven;

    const datos = { padres: [], hijos: [] };

    let rows, rows2;

    if (ven && ven.trim() !== "") {
      rows = await executeQuery(
        `SELECT v.pag_id AS id, v.pag_description, v.pag_url AS toa, v.pag_icon AS icon, v.pag_order, v.pag_name AS label FROM tbl_pages v WHERE pag_parent = 0 AND v.pag_id IN(${ven}) ORDER BY v.pag_order`,
        [],
        connection
      );

      if (rows.length > 0) {
        datos.padres = rows;

        rows2 = await executeQuery(
          `SELECT v.pag_id, v.pag_description, v.pag_parent AS padre, v.pag_url AS toa, v.pag_icon AS icon, v.pag_order, v.pag_name AS label FROM tbl_pages v WHERE pag_parent != 0 AND v.pag_id IN(${ven}) ORDER BY v.pag_order`,
          [],
          connection
        );

        if (rows2.length > 0) {
          datos.hijos = rows2;
        }
      }
    } else {
      rows = await executeQuery(
        `SELECT v.pag_id AS id, v.pag_description, v.pag_url AS toa, v.pag_icon AS icon, v.pag_order, v.pag_name AS label FROM tbl_pages v JOIN tbl_page_permissions p ON v.pag_id = p.pag_id WHERE pag_parent = 0 AND p.pro_id = $1 ORDER BY v.pag_order`,
        [per],
        connection
      );

      if (rows.length > 0) {
        datos.padres = rows;

        rows2 = await executeQuery(
          `SELECT v.pag_id, v.pag_description, v.pag_parent AS padre, v.pag_url AS toa, v.pag_icon AS icon, v.pag_order, v.pag_name AS label FROM tbl_pages v JOIN tbl_page_permissions p ON v.pag_id = p.pag_id WHERE pag_parent != 0 AND p.pro_id = $1 ORDER BY v.pag_order`,
          [per],
          connection
        );

        if (rows2.length > 0) {
          datos.hijos = rows2;
        }
      }
    }

    return datos;
  } finally {
    releaseConnection(connection);
  }
};

export const getProfiles = async () => {
  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT pro_id AS value, pro_name AS label FROM tbl_profiles WHERE sta_id = 1 ORDER BY label`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const verifyToken = async (token) => {
  if (!token) {
    const error = new Error("Autorización inválida");
    error.statusCode = 401;
    throw error;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let connection = null;
  try {
    connection = await getConnection();

    const rows = await executeQuery(
      `SELECT
         u.use_id AS "useId",
         u.use_user AS username,
         u.use_name AS name,
         u.use_last_name AS "lastName",
         u.use_email AS email,
         u.pro_id AS "proId",
         p.pro_name AS "profileName"
       FROM tbl_users u
       LEFT JOIN tbl_profiles p ON u.pro_id = p.pro_id
       WHERE u.use_id = $1 AND u.use_email = $2 AND u.sta_id IN (1,4) LIMIT 1`,
      [decoded.useId, decoded.email],
      connection
    );

    if (!rows || rows.length === 0) {
      const error = new Error("Autorización inválida");
      error.statusCode = 401;
      throw error;
    }

    const userData = rows[0];

    const fullName = [userData.name, userData.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const rowsPermisos = await executeQuery(
      `SELECT per_id AS "perId" FROM tbl_user_permissions WHERE use_id = $1`,
      [decoded.useId],
      connection
    );
    const permissions = rowsPermisos.map((row) => row.perId);

    return {
      useId: userData.useId,
      username: userData.username,
      fullName,
      email: userData.email,
      proId: userData.proId,
      profileName: userData.profileName,
      changePassword: decoded.changePassword,
      permissions,
    };
  } finally {
    releaseConnection(connection);
  }
};

export const getUserPermissions = async ({ useId }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const permissions = await executeQuery(
      `SELECT per_id AS "perId" FROM tbl_user_permissions WHERE use_id = $1`,
      [useId],
      connection
    );

    // FIND_IN_SET no existe en Postgres: se reemplaza convirtiendo la lista
    // separada por comas en un array y comprobando pertenencia con ANY().
    const windows = await executeQuery(
      `SELECT v.pag_url AS path
       FROM tbl_pages v
       JOIN tbl_users u ON v.pag_id::text = ANY(string_to_array(u.use_pages, ','))
       WHERE u.use_id = $1`,
      [useId],
      connection
    );

    return { permissions, windows };
  } finally {
    releaseConnection(connection);
  }
};

export const getStatusesByScope = async ({ scope, excludesKeys = [] }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const whereConditions = ['sta_id != 3', 'sta_scope = $1'];
    const params = [scope];

    if (excludesKeys && excludesKeys.length > 0) {
      const placeholders = excludesKeys.map((_, i) => `$${params.length + i + 1}`).join(',');
      whereConditions.push(`sta_key NOT IN (${placeholders})`);
      params.push(...excludesKeys);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    return await executeQuery(
      `SELECT sta_id AS value, sta_name AS label, sta_color FROM tbl_status ${whereClause} ORDER BY sta_order ASC`,
      params,
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const getModules = async () => {
  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT mod_id AS id, mod_nombre AS nombre FROM tbl_modulos`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};
