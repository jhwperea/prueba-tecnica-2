import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";

/**
 * Búsqueda de motos por placa (coincidencia parcial), con datos del cliente.
 * Usado en el flujo de creación de orden (buscar por placa).
 */
export const searchBikesByPlate = async ({ plate }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const where = ["b.sta_id != 3"];
    const params = [];
    if (plate && plate.trim()) {
      where.push("b.bik_plate LIKE ?");
      params.push(`%${plate.trim().toUpperCase()}%`);
    }

    return await executeQuery(
      `SELECT
         b.bik_id AS id,
         b.bik_plate AS placa,
         b.bik_brand AS brand,
         b.bik_model AS model,
         b.bik_cylinder AS cylinder,
         b.cli_id AS cliId,
         c.cli_id AS clientCliId,
         c.cli_name AS clientName,
         c.cli_phone AS clientPhone,
         c.cli_email AS clientEmail
       FROM tbl_bikes b
       JOIN tbl_clients c ON b.cli_id = c.cli_id
       WHERE ${where.join(" AND ")}
       ORDER BY b.bik_create_at DESC`,
      params,
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

/**
 * Listado simple de motos activas para combos.
 */
export const getBikes = async () => {
  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT b.bik_id AS value, CONCAT(b.bik_plate, ' - ', b.bik_brand, ' ', b.bik_model) AS label
       FROM tbl_bikes b
       WHERE b.sta_id != 3
       ORDER BY b.bik_plate ASC`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

export const paginationBikes = async ({
  plate,
  brand,
  cliId,
  rows,
  first,
  sortField,
  sortOrder,
}) => {
  const order = sortOrder === 1 ? "ASC" : "DESC";
  let connection = null;
  try {
    connection = await getConnection();

    const fromClause = `
      FROM tbl_bikes b
      JOIN tbl_clients c ON b.cli_id = c.cli_id
      LEFT JOIN tbl_status e ON b.sta_id = e.sta_id
    `;
    const whereConditions = ["b.sta_id != 3"];

    if (plate) whereConditions.push(`(b.bik_plate LIKE '%${plate.toUpperCase()}%')`);
    if (brand) whereConditions.push(`(b.bik_brand LIKE '%${brand}%')`);
    if (cliId) whereConditions.push(`(b.cli_id = ${Number(cliId)})`);

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const sortColumnMap = {
      plate: "b.bik_plate",
      brand: "b.bik_brand",
      model: "b.bik_model",
      clientName: "c.cli_name",
    };
    const sortColumn = sortColumnMap[sortField] || "b.bik_plate";

    const mainQuery = `
      SELECT
        b.bik_id AS bikId,
        b.bik_plate AS plate,
        b.bik_brand AS brand,
        b.bik_model AS model,
        b.bik_cylinder AS cylinder,
        b.cli_id AS cliId,
        c.cli_name AS clientName,
        c.cli_phone AS clientPhone,
        b.sta_id AS staId,
        e.sta_name AS statusName,
        b.bik_update_at AS updatedAt
      ${fromClause} ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT ${rows} OFFSET ${first}
    `;

    const countQuery = `SELECT COUNT(DISTINCT b.bik_id) tot ${fromClause} ${whereClause}`;

    const results = await executeQuery(mainQuery, [], connection);
    const rowsc = await executeQuery(countQuery, [], connection);

    return { results, total: rowsc[0].tot };
  } finally {
    releaseConnection(connection);
  }
};

export const saveBike = async ({
  bikId,
  plate,
  brand,
  model,
  cylinder,
  cliId,
  staId,
  useBy,
}) => {
  if (!plate || !plate.trim()) {
    const error = new Error("La placa de la moto es obligatoria.");
    error.status = 400;
    throw error;
  }
  if (!brand || !brand.trim()) {
    const error = new Error("La marca de la moto es obligatoria.");
    error.status = 400;
    throw error;
  }
  if (!model || !model.trim()) {
    const error = new Error("El modelo de la moto es obligatorio.");
    error.status = 400;
    throw error;
  }
  if (!cliId) {
    const error = new Error("El cliente propietario es obligatorio.");
    error.status = 400;
    throw error;
  }

  const formattedPlate = plate.trim().toUpperCase();

  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const client = await executeQuery(
      `SELECT cli_id FROM tbl_clients WHERE cli_id = ? AND sta_id != 3 LIMIT 1`,
      [cliId],
      connection
    );
    if (!client.length) {
      const error = new Error(`El cliente con ID ${cliId} no existe.`);
      error.status = 404;
      throw error;
    }

    const duplicateWhere = bikId > 0 ? `AND bik_id != ${Number(bikId)}` : "";
    const existing = await executeQuery(
      `SELECT bik_id FROM tbl_bikes WHERE bik_plate = ? AND sta_id != 3 ${duplicateWhere} LIMIT 1`,
      [formattedPlate],
      connection
    );
    if (existing.length > 0) {
      const error = new Error(`Ya existe una moto registrada con la placa ${formattedPlate}.`);
      error.status = 400;
      throw error;
    }

    if (bikId > 0) {
      const result = await executeQuery(
        `UPDATE tbl_bikes
         SET bik_plate = ?, bik_brand = ?, bik_model = ?, bik_cylinder = ?, cli_id = ?, sta_id = ?, bik_update_by = ?
         WHERE bik_id = ?`,
        [formattedPlate, brand.trim(), model.trim(), cylinder ? String(cylinder).trim() : null, cliId, staId || 1, useBy, bikId],
        connection
      );

      if (result.affectedRows === 0) {
        const error = new Error("No se encontró la moto para ser actualizada.");
        error.status = 400;
        throw error;
      }

      await connection.commit();
      return { message: `Moto ${formattedPlate} actualizada correctamente.`, bikId };
    }

    const insertResult = await executeQuery(
      `INSERT INTO tbl_bikes (bik_plate, bik_brand, bik_model, bik_cylinder, cli_id, sta_id, bik_create_by, bik_update_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [formattedPlate, brand.trim(), model.trim(), cylinder ? String(cylinder).trim() : null, cliId, staId || 1, useBy, useBy],
      connection
    );

    await connection.commit();
    return {
      message: `Moto ${formattedPlate} creada correctamente.`,
      bikId: insertResult.insertId,
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteBike = async ({ bikId, updatedBy }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const ordersInUse = await executeQuery(
      `SELECT ord_id FROM tbl_work_orders WHERE bik_id = ? LIMIT 1`,
      [bikId],
      connection
    );
    if (ordersInUse.length > 0) {
      const error = new Error(
        "No se puede eliminar la moto porque tiene órdenes de trabajo asociadas."
      );
      error.status = 400;
      throw error;
    }

    const result = await executeQuery(
      `UPDATE tbl_bikes SET sta_id = 3, bik_update_by = ? WHERE bik_id = ?`,
      [updatedBy, bikId],
      connection
    );

    if (result.affectedRows === 0) {
      const error = new Error("Moto no encontrada o no se pudo eliminar.");
      error.status = 404;
      throw error;
    }

    await connection.commit();
    return { message: "Moto eliminada correctamente." };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
