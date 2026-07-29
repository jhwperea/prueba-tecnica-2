import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import _ from "lodash";

export const paginationProfiles = async ({
  useId,
  name,
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

    const params = [];
    const wheres = ["p.sta_id != 3"];

    if (name) {
      params.push(`%${name}%`);
      wheres.push(`p.pro_name LIKE $${params.length}`);
    }

    if (staId) {
      params.push(staId);
      wheres.push(`p.sta_id = $${params.length}`);
    }

    if (useId != 1) {
      wheres.push("p.pro_id != 1");
    }

    const whereClause = `WHERE ${wheres.join(" AND ")}`;

    const mainQuery = `
      SELECT
        p.pro_id AS "proId",
        p.pro_name AS name,
        e.sta_name AS "statusName",
        p.pro_update_by AS "updatedBy",
        p.pro_update_at AS "updatedAt",
        p.sta_id AS "staId"
      FROM tbl_profiles p
      JOIN tbl_status e ON p.sta_id = e.sta_id
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT ${Number(rows)} OFFSET ${Number(first)}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT pro_id) tot
      FROM tbl_profiles p
      JOIN tbl_status e ON p.sta_id = e.sta_id
      ${whereClause}
    `;

    const results = await executeQuery(mainQuery, params, connection);
    const rowsc = await executeQuery(countQuery, params, connection);

    return { results, total: rowsc[0].tot };
  } finally {
    releaseConnection(connection);
  }
};

export const getModules = async ({ proId }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const resultsAso = await executeQuery(
      `SELECT v.pag_parent AS parent, v.pag_id AS "pagId", v.pag_description AS description
       FROM tbl_pages v
       JOIN tbl_page_permissions pp ON v.pag_id = pp.pag_id
       WHERE pp.pro_id = $1
       ORDER BY v.pag_order`,
      [proId],
      connection
    );

    const idasociados = resultsAso.length
      ? resultsAso.map(({ pagId }) => pagId).join(",")
      : "''";

    const results = await executeQuery(
      `SELECT pag_parent AS parent, pag_id AS "pagId", pag_description AS description
       FROM tbl_pages
       WHERE pag_id NOT IN (${idasociados})`,
      [],
      connection
    );

    return { associated: resultsAso, unassociated: results };
  } finally {
    releaseConnection(connection);
  }
};

export const saveProfile = async ({
  proId,
  name,
  staId,
  modules,
  previousModules,
  useBy,
}) => {
  const wh = proId > 0 ? `AND pro_id != ${proId}` : "";
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const resultsQuery = await executeQuery(
      `SELECT pro_id FROM tbl_profiles WHERE pro_name = $1 AND sta_id != 3 ${wh} LIMIT 1`,
      [name],
      connection
    );

    if (resultsQuery.length > 0) {
      const error = new Error(
        "Ya existe un Perfil con el nombre ingresado. Verificar"
      );
      error.status = 400;
      throw error;
    }

    if (proId > 0) {
      const updateProfile = await executeQuery(
        `UPDATE tbl_profiles SET pro_name = $1, sta_id = $2, pro_update_by = $3 WHERE pro_id = $4 RETURNING pro_id`,
        [name, staId, useBy, proId],
        connection
      );

      if (updateProfile.length > 0) {
        const moddelete = _.difference(previousModules, modules);
        const modinsert = _.difference(modules, previousModules);

        if (moddelete.length > 0) {
          await executeQuery(
            `DELETE FROM tbl_page_permissions WHERE pro_id = $1 AND pag_id IN(${moddelete.join(",")})`,
            [proId],
            connection
          );
        }

        for (const pagId of modinsert) {
          await executeQuery(
            "INSERT INTO tbl_page_permissions(pro_id, pag_id) values($1, $2)",
            [proId, pagId],
            connection
          );
        }

        await connection.query("COMMIT");
        return { message: `Perfil ${name} Modificado Correctamente` };
      }

      const error = new Error("No se encontró el perfil para ser actualizado.");
      error.status = 400;
      throw error;
    }

    const insertProfile = await executeQuery(
      `INSERT INTO tbl_profiles (pro_name, sta_id, pro_create_by, pro_update_by) VALUES($1,$2,$3,$4) RETURNING pro_id AS "proId"`,
      [name, staId, useBy, useBy],
      connection
    );

    if (insertProfile.length > 0 && insertProfile[0].proId > 0) {
      const newProId = insertProfile[0].proId;
      for (const pagId of modules) {
        await executeQuery(
          "INSERT INTO tbl_page_permissions(pro_id, pag_id) values($1, $2)",
          [newProId, pagId],
          connection
        );
      }

      await connection.query("COMMIT");
      return {
        message: `Perfil ${name} Creado Correctamente`,
        proId: newProId,
      };
    }

    const error = new Error("Ocurrió un error al intentar registrar el perfil.");
    error.status = 500;
    throw error;
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteProfile = async ({ proId, updatedBy }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const deleteProfile = await executeQuery(
      "UPDATE tbl_profiles SET sta_id = 3, pro_update_by = $1 WHERE pro_id = $2 RETURNING pro_id",
      [updatedBy, proId],
      connection
    );

    if (deleteProfile.length > 0) {
      await executeQuery(
        "DELETE FROM tbl_page_permissions WHERE pro_id = $1",
        [proId],
        connection
      );

      await connection.query("COMMIT");
      return { message: "Perfil Eliminado Correctamente" };
    }

    const error = new Error("Error al eliminar el perfil.");
    error.statusCode = 400;
    throw error;
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
