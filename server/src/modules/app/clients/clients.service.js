import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";

/**
 * Listado simple de clientes activos, útil para selects/combos (socketDropdown).
 */
export const getClients = async () => {
  let connection = null;
  try {
    connection = await getConnection();

    return await executeQuery(
      `SELECT cli_id AS value, cli_name AS label, cli_phone AS phone, cli_email AS email
       FROM tbl_clients
       WHERE sta_id != 3
       ORDER BY cli_name ASC`,
      [],
      connection
    );
  } finally {
    releaseConnection(connection);
  }
};

/**
 * Paginación de clientes con filtros de búsqueda por nombre, teléfono o correo.
 */
export const paginationClients = async ({
  name,
  phone,
  email,
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
      FROM tbl_clients c
      LEFT JOIN tbl_status e ON c.sta_id = e.sta_id
    `;
    const whereConditions = ["c.sta_id != 3"];

    if (name) whereConditions.push(`(c.cli_name LIKE '%${name}%')`);
    if (phone) whereConditions.push(`(c.cli_phone LIKE '%${phone}%')`);
    if (email) whereConditions.push(`(c.cli_email LIKE '%${email}%')`);

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const sortColumnMap = {
      name: "c.cli_name",
      phone: "c.cli_phone",
      email: "c.cli_email",
      bikesCount: "bikesCount",
    };
    const sortColumn = sortColumnMap[sortField] || "c.cli_name";

    const mainQuery = `
      SELECT
        c.cli_id AS cliId,
        c.cli_name AS name,
        c.cli_phone AS phone,
        c.cli_email AS email,
        c.sta_id AS staId,
        e.sta_name AS statusName,
        (SELECT COUNT(*) FROM tbl_bikes b WHERE b.cli_id = c.cli_id AND b.sta_id != 3) AS bikesCount,
        c.cli_update_at AS updatedAt
      ${fromClause} ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT ${rows} OFFSET ${first}
    `;

    const countQuery = `SELECT COUNT(DISTINCT c.cli_id) tot ${fromClause} ${whereClause}`;

    const results = await executeQuery(mainQuery, [], connection);
    const rowsc = await executeQuery(countQuery, [], connection);

    return { results, total: rowsc[0].tot };
  } finally {
    releaseConnection(connection);
  }
};

export const getClientById = async ({ cliId }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const rows = await executeQuery(
      `SELECT cli_id AS cliId, cli_name AS name, cli_phone AS phone, cli_email AS email, sta_id AS staId
       FROM tbl_clients WHERE cli_id = ? LIMIT 1`,
      [cliId],
      connection
    );

    if (!rows.length) {
      const error = new Error(`Cliente con ID ${cliId} no encontrado.`);
      error.status = 404;
      throw error;
    }

    const bikes = await executeQuery(
      `SELECT bik_id AS bikId, bik_plate AS plate, bik_brand AS brand, bik_model AS model, bik_cylinder AS cylinder
       FROM tbl_bikes WHERE cli_id = ? AND sta_id != 3 ORDER BY bik_plate ASC`,
      [cliId],
      connection
    );

    return { ...rows[0], bikes };
  } finally {
    releaseConnection(connection);
  }
};

export const saveClient = async ({ cliId, name, phone, email, staId, useBy }) => {
  if (!name || !name.trim()) {
    const error = new Error("El nombre del cliente es obligatorio.");
    error.status = 400;
    throw error;
  }
  if (!phone || !phone.trim()) {
    const error = new Error("El teléfono del cliente es obligatorio.");
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    if (cliId > 0) {
      const result = await executeQuery(
        `UPDATE tbl_clients
         SET cli_name = ?, cli_phone = ?, cli_email = ?, sta_id = ?, cli_update_by = ?
         WHERE cli_id = ?`,
        [name.trim(), phone.trim(), email ? email.trim() : null, staId || 1, useBy, cliId],
        connection
      );

      if (result.affectedRows === 0) {
        const error = new Error("No se encontró el cliente para ser actualizado.");
        error.status = 400;
        throw error;
      }

      await connection.commit();
      return { message: `Cliente ${name} actualizado correctamente.`, cliId };
    }

    const insertResult = await executeQuery(
      `INSERT INTO tbl_clients (cli_name, cli_phone, cli_email, sta_id, cli_create_by, cli_update_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), phone.trim(), email ? email.trim() : null, staId || 1, useBy, useBy],
      connection
    );

    await connection.commit();
    return {
      message: `Cliente ${name} creado correctamente.`,
      cliId: insertResult.insertId,
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteClient = async ({ cliId, updatedBy }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const bikesInUse = await executeQuery(
      `SELECT bik_id FROM tbl_bikes WHERE cli_id = ? AND sta_id != 3 LIMIT 1`,
      [cliId],
      connection
    );

    if (bikesInUse.length > 0) {
      const error = new Error(
        "No se puede eliminar el cliente porque tiene motocicletas registradas activas."
      );
      error.status = 400;
      throw error;
    }

    const result = await executeQuery(
      `UPDATE tbl_clients SET sta_id = 3, cli_update_by = ? WHERE cli_id = ?`,
      [updatedBy, cliId],
      connection
    );

    if (result.affectedRows === 0) {
      const error = new Error("Cliente no encontrado o no se pudo eliminar.");
      error.status = 404;
      throw error;
    }

    await connection.commit();
    return { message: "Cliente eliminado correctamente." };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
