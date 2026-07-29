import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import { getIO } from "../../../common/configs/socket.manager.js";

export const getProfileWindows = async ({ proId, useId }) => {
  if (!proId && !useId) {
    const error = new Error(
      "Debe proporcionar al menos el ID de usuario (useId) o el ID de perfil (proId)."
    );
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    let rows = [];

    if (useId) {
      const ventanaRows = await executeQuery(
        `SELECT pag_id FROM tbl_page_permissions WHERE pro_id = (SELECT pro_id FROM tbl_users WHERE use_id = $1)`,
        [useId],
        connection
      );

      if (!ventanaRows || ventanaRows.length === 0) {
        return [];
      }

      const pagIds = ventanaRows.map((v) => v.pag_id);
      if (pagIds.length === 0) return [];

      const placeholders = pagIds.map((_, i) => `$${i + 1}`).join(",");

      rows = await executeQuery(
        `SELECT
           v1.pag_id AS "pagId",
           v1.pag_description AS description,
           v1.pag_parent AS parent,
           v2.pag_description AS "parentDescription",
           COUNT(p.per_id) AS count,
           v1.pag_order AS "pagOrder"
         FROM tbl_pages v1
         LEFT JOIN tbl_pages v2 ON v1.pag_parent = v2.pag_id
         LEFT JOIN tbl_permissions p ON v1.pag_id = p.pag_id
         WHERE v1.pag_id IN (${placeholders})
         GROUP BY "pagId", description, parent, "parentDescription", "pagOrder"
         ORDER BY v1.pag_parent DESC, v1.pag_order ASC`,
        pagIds,
        connection
      );
    } else if (proId) {
      const pagRows = await executeQuery(
        `SELECT pag_id FROM tbl_page_permissions WHERE pro_id = $1`,
        [proId],
        connection
      );

      if (!pagRows || pagRows.length === 0) {
        return [];
      }

      const pagIds = pagRows.map((v) => v.pag_id);
      const placeholders = pagIds.map((_, i) => `$${i + 1}`).join(",");

      rows = await executeQuery(
        `SELECT
           v1.pag_id AS "pagId",
           v1.pag_description AS description,
           v1.pag_parent AS parent,
           v2.pag_description AS "parentDescription",
           COUNT(p.per_id) AS count,
           v1.pag_order AS "pagOrder"
         FROM tbl_pages v1
         LEFT JOIN tbl_pages v2 ON v1.pag_parent = v2.pag_id
         LEFT JOIN tbl_permissions p ON v1.pag_id = p.pag_id
         WHERE v1.pag_id IN (${placeholders})
         GROUP BY "pagId", description, parent, "parentDescription", "pagOrder"
         ORDER BY v1.pag_parent DESC, v1.pag_order ASC`,
        pagIds,
        connection
      );
    }

    const pagePermissions = await Promise.all(
      rows.map(async (page) => {
        const permissions = await executeQuery(
          `SELECT per_id AS "perId", per_name AS name FROM tbl_permissions WHERE pag_id = $1 ORDER BY per_order ASC`,
          [page.pagId],
          connection
        );
        return { ...page, permissions };
      })
    );

    return pagePermissions;
  } finally {
    releaseConnection(connection);
  }
};

export const getUserPermissions = async ({ pagIds, useId }) => {
  if (!Array.isArray(pagIds) || pagIds.length === 0 || !useId) {
    return [];
  }

  let connection = null;
  try {
    connection = await getConnection();

    const placeholders = pagIds.map((_, i) => `$${i + 2}`).join(",");

    return await executeQuery(
      `SELECT
         p.pag_id AS "pagId",
         p.per_id AS "perId",
         p.per_name AS name,
         CASE WHEN pu.use_id IS NOT NULL THEN 1 ELSE 0 END AS assigned
       FROM tbl_permissions p
       LEFT JOIN tbl_user_permissions pu ON p.per_id = pu.per_id AND pu.use_id = $1
       WHERE p.pag_id IN (${placeholders})
       ORDER BY p.per_order ASC`,
      [useId, ...pagIds],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const getProfilePermissions = async ({ pagIds, proId }) => {
  if (!Array.isArray(pagIds) || pagIds.length === 0 || !proId) {
    return [];
  }

  let connection = null;
  try {
    connection = await getConnection();

    const placeholders = pagIds.map((_, i) => `$${i + 2}`).join(",");

    return await executeQuery(
      `SELECT
         p.pag_id AS "pagId",
         p.per_id AS "perId",
         p.per_name AS name,
         CASE WHEN pf.pro_id IS NOT NULL THEN 1 ELSE 0 END AS assigned
       FROM tbl_permissions p
       LEFT JOIN tbl_profile_permissions pf ON p.per_id = pf.per_id AND pf.pro_id = $1
       WHERE p.pag_id IN (${placeholders})
       ORDER BY p.per_order ASC`,
      [proId, ...pagIds],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const updateProfilePermissions = async ({ permissions, proId }) => {
  if (!permissions || !proId) {
    const error = new Error(
      "Los permisos (permissions) y el perfil (proId) son obligatorios"
    );
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const currentPermissions = await executeQuery(
      `SELECT per_id FROM tbl_profile_permissions WHERE pro_id = $1`,
      [proId],
      connection
    );

    const currentSet = new Set(currentPermissions.map((p) => p.per_id));
    const toDelete = Array.from(currentSet).filter(
      (perId) => !permissions.includes(perId)
    );
    const toInsert = permissions.filter(
      (perId) => !currentSet.has(perId)
    );

    if (toDelete.length > 0) {
      await executeQuery(
        `DELETE FROM tbl_profile_permissions WHERE pro_id = $1 AND per_id IN (${toDelete.join(",")})`,
        [proId],
        connection
      );
    }

    for (const perId of toInsert) {
      await executeQuery(
        `INSERT INTO tbl_profile_permissions (per_id, pro_id) VALUES ($1, $2)`,
        [perId, proId],
        connection
      );
    }

    await connection.query("COMMIT");
    return { message: "Permisos actualizados" };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const updateUserPermissions = async ({ permissions, useId }) => {
  if (!permissions || !useId) {
    const error = new Error(
      "Los permisos (permissions) y el usuario (useId) son obligatorios"
    );
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const currentPermissions = await executeQuery(
      `SELECT per_id FROM tbl_user_permissions WHERE use_id = $1`,
      [useId],
      connection
    );

    const currentSet = new Set(currentPermissions.map((p) => p.per_id));
    const toDelete = Array.from(currentSet).filter(
      (perId) => !permissions.includes(perId)
    );
    const toInsert = permissions.filter(
      (perId) => !currentSet.has(perId)
    );

    if (toDelete.length > 0) {
      await executeQuery(
        `DELETE FROM tbl_user_permissions WHERE use_id = $1 AND per_id IN (${toDelete.join(",")})`,
        [useId],
        connection
      );
    }

    for (const perId of toInsert) {
      await executeQuery(
        `INSERT INTO tbl_user_permissions (per_id, use_id) VALUES ($1, $2)`,
        [perId, useId],
        connection
      );
    }

    await connection.query("COMMIT");

    const updatedPermissions = await executeQuery(
      `SELECT per_id AS "perId" FROM tbl_user_permissions WHERE use_id = $1`,
      [useId],
      connection
    );

    const io = getIO();
    io.emit("update-permissions", { useId, updatedPermissions });

    return { message: "Permisos actualizados" };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const getAllPages = async () => {
  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT pag_id AS id, pag_description AS description, pag_url AS url FROM tbl_pages ORDER BY pag_order`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};
