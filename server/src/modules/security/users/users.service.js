import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import { hashPassword } from "../../../common/utils/funciones.js";

export const getUsersByPermission = async ({ perId }) => {
  const permisos =
    typeof perId === "string"
      ? perId.split(",").map(Number)
      : Array.isArray(perId)
        ? perId.map(Number)
        : [Number(perId)];

  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT
         CONCAT(COALESCE(u.use_name,''),' ',COALESCE(u.use_last_name,'')) AS name,
         u.use_id AS "useId",
         STRING_AGG(pu.per_id::text, ',') AS permissions
       FROM tbl_user_permissions pu
       JOIN tbl_users u ON u.use_id = pu.use_id
       WHERE per_id IN (${permisos.join(",")}) AND u.sta_id != 3
       GROUP BY u.use_id
       ORDER BY name ASC`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const getUsers = async ({ proId }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const filtros = ["sta_id != 3"];
    const params = [];

    if (proId) {
      params.push(proId);
      filtros.push(`pro_id = $${params.length}`);
    }

    const whereClause = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    return await executeQuery(
      `SELECT
         use_id AS value,
         CONCAT(COALESCE(use_name, ''), ' ', COALESCE(use_last_name, '')) AS label,
         use_email AS email,
         use_identification AS identification
       FROM tbl_users
       ${whereClause}
       ORDER BY label ASC`,
      params,
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const paginationUsers = async ({
  useId,
  proId,
  name,
  lastName,
  email,
  identification,
  username,
  staId,
  rows,
  first,
  sortField,
  sortOrder,
}) => {
  const order = sortOrder === 1 ? "ASC" : "DESC";
  let connection = null;
  try {
    connection = await getConnection();

    const from = `
      FROM tbl_users u
      JOIN tbl_profiles p ON u.pro_id = p.pro_id AND p.sta_id = 1
      JOIN tbl_status e ON u.sta_id = e.sta_id
    `;

    const whereConditions = [];

    // if (useId != 1) {
    //   whereConditions.push("u.use_id != 1");
    // }

    if (proId) {
      whereConditions.push(`(u.pro_id = ${proId})`);
    }

    if (name) {
      whereConditions.push(`(u.use_name LIKE REPLACE('%${name}%', ' ', '%'))`);
    }

    if (lastName) {
      whereConditions.push(
        `(u.use_last_name LIKE REPLACE('%${lastName}%', ' ', '%'))`
      );
    }

    if (email) {
      whereConditions.push(
        `(u.use_email LIKE REPLACE('%${email}%', ' ', '%'))`
      );
    }

    if (identification) {
      whereConditions.push(
        `(u.use_identification LIKE REPLACE('%${identification}%', ' ', '%'))`
      );
    }

    if (username) {
      whereConditions.push(
        `(u.use_user LIKE REPLACE('%${username}%', ' ', '%'))`
      );
    }

    if (staId) {
      whereConditions.push(`(u.sta_id = ${staId})`);
    }

    whereConditions.push("u.sta_id != 3");

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    const mainQuery = `
      SELECT
        u.use_id AS "useId",
        u.use_name AS name,
        u.use_last_name AS "lastName",
        u.use_identification AS identification,
        u.use_user AS username,
        u.use_email AS email,
        p.pro_name AS "profileName",
        e.sta_name AS "statusName",
        u.use_access AS access,
        u.use_change_password AS "changePassword",
        u.use_update_at AS "updatedAt",
        u.use_update_by AS "updatedBy",
        u.sta_id AS "staId",
        u.pro_id AS "proId",
        u.use_pages AS "usePages"
      ${from} ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT ${Number(rows)} OFFSET ${Number(first)}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT u.use_id) tot
      ${from} ${whereClause}
    `;

    const results = await executeQuery(mainQuery, [], connection);
    const rowsc = await executeQuery(countQuery, [], connection);

    return { results, total: rowsc[0].tot };
  } finally {
    releaseConnection(connection);
  }
};

export const countUsers = async ({ useId }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const wh = +useId !== 1 ? "AND p.pro_id != 1" : "";

    return await executeQuery(
      `SELECT COUNT(u.use_id) count, p.pro_name AS name, p.pro_id AS "proId"
       FROM tbl_users u
       JOIN tbl_profiles p ON p.pro_id = u.pro_id
       WHERE u.sta_id != 3 AND p.sta_id = 1 ${wh}
       GROUP BY "proId", name
       ORDER BY p.pro_name`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

async function checkIfUserExists({
  identification,
  email,
  username,
  useId,
  connection,
}) {
  const parameters = [];
  const conditions = [];

  if (identification) {
    parameters.push(identification);
    conditions.push(`use_identification = $${parameters.length}`);
  }
  if (email) {
    parameters.push(email);
    conditions.push(`use_email = $${parameters.length}`);
  }
  if (username) {
    parameters.push(username);
    conditions.push(`use_user = $${parameters.length}`);
  }

  if (conditions.length === 0) return [];

  let query = `
    SELECT use_id
    FROM tbl_users
    WHERE sta_id != 3
      AND (${conditions.join(" OR ")})
      ${useId > 0 ? `AND use_id != ${useId}` : ""}
    LIMIT 1
  `;

  return await executeQuery(query, parameters, connection);
}

export const saveUser = async ({
  useId,
  proId,
  name,
  lastName,
  identification,
  username,
  email,
  password,
  access,
  staId: statusId,
  useBy,
  changePassword,
  ProfileMode,
  field,
  value,
  usePages,
}) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    if (ProfileMode) {
      if (!field) return;

      await executeQuery(
        `UPDATE tbl_users SET ${field} = $1 WHERE use_id = $2`,
        [value === "null" ? null : value, Number(useId)],
        connection
      );

      await connection.query("COMMIT");
      return {
        message:
          "Modo perfil activado, Se actualizaron los cambios correctamente...",
      };
    }

    const existingUser = await checkIfUserExists({
      identification,
      email,
      username,
      useId,
      connection,
    });

    if (existingUser.length > 0) {
      const error = new Error(
        "Ya existe un usuario con el documento, correo o usuario ingresado. Verificar"
      );
      error.status = 400;
      throw error;
    }

    if (useId > 0) {
      await executeQuery(
        `UPDATE tbl_users
         SET use_name = $1, use_last_name = $2, use_identification = $3,
             use_user = $4, use_email = $5, pro_id = $6, sta_id = $7,
             use_access = $8, use_change_password = $9,
             use_update_by = $10, use_pages = $11
         WHERE use_id = $12`,
        [
          name,
          lastName,
          identification === "null" ? null : identification,
          username === "null" ? null : username,
          email === "null" ? null : email,
          proId || null,
          statusId,
          access,
          changePassword || null,
          useBy,
          usePages || "",
          useId,
        ],
        connection
      );

      if (password) {
        const hash = await hashPassword(password);
        await executeQuery(
          "UPDATE tbl_users SET use_password = $1 WHERE use_id = $2",
          [hash, useId],
          connection
        );
      }

      await connection.query("COMMIT");
      return { message: "Usuario Actualizado Correctamente", useId };
    }

    const newUserResult = await executeQuery(
      `INSERT INTO tbl_users (use_name, use_last_name, use_identification, use_user,
         use_email, use_password, pro_id, sta_id, use_access,
         use_change_password, use_create_by, use_update_by, use_pages
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING use_id AS "useId"`,
      [
        name,
        lastName,
        identification === "null" ? null : identification,
        username === "null" ? null : username,
        email === "null" ? null : email,
        password ? await hashPassword(password) : null,
        proId,
        statusId,
        access ? 1 : 0,
        changePassword || null,
        useBy,
        useBy,
        usePages || "",
      ],
      connection
    );

    if (!newUserResult.length || !newUserResult[0].useId) {
      const error = new Error("Error al insertar el usuario.");
      error.status = 400;
      throw error;
    }

    const newUserId = newUserResult[0].useId;

    await executeQuery(
      `INSERT INTO tbl_user_permissions (per_id, use_id)
       SELECT per_id, $1 FROM tbl_profile_permissions WHERE pro_id = $2`,
      [newUserId, proId],
      connection
    );

    await connection.query("COMMIT");
    return {
      message: "Usuario Creado Correctamente",
      useId: newUserId,
    };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteUser = async ({ useId, updatedBy }) => {
  if (!useId || !updatedBy) {
    const error = new Error(
      "El ID del usuario y el usuario actual son obligatorios"
    );
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const result = await executeQuery(
      `UPDATE tbl_users SET sta_id = 3, use_update_by = $1 WHERE use_id = $2 RETURNING use_id`,
      [updatedBy, useId],
      connection
    );

    if (result.length > 0) {
      await connection.query("COMMIT");
      return { message: "Usuario Eliminado Correctamente" };
    }

    const error = new Error("Usuario no encontrado o no se pudo eliminar");
    error.status = 404;
    throw error;
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
