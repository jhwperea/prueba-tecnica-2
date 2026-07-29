import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../common/configs/db.config.js";

export const getMasterTemplates = async () => {
  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT mas_id AS id, mas_nombre AS nombre FROM tbl_template WHERE est_id != 3 ORDER BY nombre ASC`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const paginationMasterTemplate = async ({
  nombre,
  estado,
  rows,
  first,
  sortField,
  sortOrder,
}) => {
  const order = sortOrder === 1 ? "ASC" : "DESC";
  let connection = null;
  try {
    connection = await getConnection();

    const fromClause =
      "FROM tbl_template t JOIN tbl_estados e ON e.est_id = t.est_id";
    const whereConditions = ["t.est_id != 3"];

    if (nombre) whereConditions.push(`(t.mas_nombre LIKE ('%${nombre}%'))`);
    if (estado) whereConditions.push(`(t.est_id = ${estado})`);

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const mainQuery = `SELECT t.mas_id AS "masId", t.mas_nombre AS nombre, t.est_id AS estado, t.mas_usu_act AS usuact, t.mas_fec_act AS fecact, e.est_nombre AS nomestado ${fromClause} ${whereClause} GROUP BY "masId", nombre, estado, usuact, fecact, nomestado ORDER BY ${sortField} ${order} LIMIT ${Number(rows)} OFFSET ${Number(first)}`;

    const countQuery = `SELECT COUNT(DISTINCT t.mas_id) tot ${fromClause} ${whereClause}`;

    const results = await executeQuery(mainQuery, [], connection);
    const rowsc = await executeQuery(countQuery, [], connection);

    return { results, total: rowsc[0].tot };
  } finally {
    releaseConnection(connection);
  }
};

export const saveMasterTemplate = async ({
  masId,
  nombre,
  estado,
  usureg,
  usuact,
}) => {
  const wh = masId > 0 ? `AND mas_id != ${masId}` : "";
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const resultsQuery = await executeQuery(
      `SELECT mas_id FROM tbl_template WHERE mas_nombre = $1 AND est_id != 3 ${wh} LIMIT 1`,
      [nombre],
      connection
    );

    if (resultsQuery.length > 0) {
      const error = new Error(
        "Ya existe un registro con el nombre ingresado. Verificar."
      );
      error.status = 400;
      throw error;
    }

    if (masId > 0) {
      const updateTemplate = await executeQuery(
        `UPDATE tbl_template SET mas_nombre = $1, est_id = $2, mas_usu_act = $3 WHERE mas_id = $4 RETURNING mas_id`,
        [nombre, estado, usuact, masId],
        connection
      );

      if (updateTemplate.length === 0) {
        const error = new Error(
          "No se encontró el registro para ser actualizado."
        );
        error.status = 400;
        throw error;
      }

      await connection.query("COMMIT");
      return { message: `Registro ${nombre} modificado correctamente.` };
    }

    const insertTemplate = await executeQuery(
      `INSERT INTO tbl_template (mas_nombre, est_id, mas_usu_reg, mas_usu_act) VALUES($1, $2, $3, $4) RETURNING mas_id AS "masId"`,
      [nombre, estado, usureg, usuact],
      connection
    );

    await connection.query("COMMIT");
    return {
      message: `Registro ${nombre} creado correctamente.`,
      masId: insertTemplate[0].masId,
    };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteMasterTemplate = async ({ masId, usuact }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const deleteTemplate = await executeQuery(
      "UPDATE tbl_template SET est_id = 3, mas_usu_act = $1 WHERE mas_id = $2 RETURNING mas_id",
      [usuact, masId],
      connection
    );

    if (deleteTemplate.length === 0) {
      const error = new Error(
        "Error al eliminar el registro. Por favor verificar."
      );
      error.status = 400;
      throw error;
    }

    await connection.query("COMMIT");
    return { message: "Registro eliminado correctamente." };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
