import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../../common/configs/db.config.js";
import { userHasPermission } from "../../../common/utils/permissions.utils.js";
import {
  ORDER_STATUS,
  validateStatusTransition,
  TALLER_PERMISSIONS,
} from "./workorders.constants.js";

const ORDER_SELECT = `
  o.ord_id AS "ordId",
  o.bik_id AS "bikId",
  o.ord_entry_date AS "entryDate",
  o.ord_fault_description AS "faultDescription",
  o.ord_status AS status,
  o.ord_total AS total,
  o.ord_create_at AS "createdAt",
  b.bik_plate AS placa,
  b.bik_brand AS brand,
  b.bik_model AS model,
  b.bik_cylinder AS cylinder,
  c.cli_id AS "cliId",
  c.cli_name AS "clientName",
  c.cli_phone AS "clientPhone",
  c.cli_email AS "clientEmail"
`;

const ORDER_FROM = `
  FROM tbl_work_orders o
  JOIN tbl_bikes b ON o.bik_id = b.bik_id
  JOIN tbl_clients c ON b.cli_id = c.cli_id
`;

/**
 * Recalcula y persiste el total de una orden a partir de sus ítems.
 */
const recalculateOrderTotal = async (ordId, connection) => {
  const items = await executeQuery(
    `SELECT item_count AS count, item_unit_value AS "unitValue" FROM tbl_work_order_items WHERE ord_id = $1`,
    [ordId],
    connection
  );

  const total = items.reduce(
    (sum, item) => sum + Number(item.count) * Number(item.unitValue),
    0
  );

  await executeQuery(
    `UPDATE tbl_work_orders SET ord_total = $1 WHERE ord_id = $2`,
    [total.toFixed(2), ordId],
    connection
  );

  return total;
};

const mapOrderRow = (row) => ({
  ordId: row.ordId,
  bikId: row.bikId,
  entryDate: row.entryDate,
  faultDescription: row.faultDescription,
  status: row.status,
  total: row.total,
  createdAt: row.createdAt,
  bike: {
    bikId: row.bikId,
    placa: row.placa,
    brand: row.brand,
    model: row.model,
    cylinder: row.cylinder,
    client: {
      cliId: row.cliId,
      name: row.clientName,
      phone: row.clientPhone,
      email: row.clientEmail,
    },
  },
});

const getItemsByOrder = async (ordId, connection) =>
  executeQuery(
    `SELECT item_id AS "itemId", ord_id AS "ordId", item_type AS type, item_description AS description,
            item_count AS count, item_unit_value AS "unitValue", item_create_at AS "createdAt"
     FROM tbl_work_order_items WHERE ord_id = $1 ORDER BY item_create_at ASC`,
    [ordId],
    connection
  );

const getHistoryByOrder = async (ordId, connection) =>
  executeQuery(
    `SELECT
       h.his_id AS "hisId",
       h.ord_id AS "ordId",
       h.his_from_status AS "fromStatus",
       h.his_to_status AS "toStatus",
       h.his_note AS note,
       h.his_create_at AS "createdAt",
       u.use_id AS "useId",
       CONCAT(COALESCE(u.use_name, ''), ' ', COALESCE(u.use_last_name, '')) AS "userName",
       p.pro_name AS "profileName"
     FROM tbl_work_order_status_history h
     LEFT JOIN tbl_users u ON h.use_id = u.use_id
     LEFT JOIN tbl_profiles p ON u.pro_id = p.pro_id
     WHERE h.ord_id = $1
     ORDER BY h.his_create_at DESC`,
    [ordId],
    connection
  );

const getFullOrder = async (ordId, connection) => {
  const rows = await executeQuery(
    `SELECT ${ORDER_SELECT} ${ORDER_FROM} WHERE o.ord_id = $1 LIMIT 1`,
    [ordId],
    connection
  );

  if (!rows.length) return null;

  const order = mapOrderRow(rows[0]);
  order.items = await getItemsByOrder(ordId, connection);
  order.history = await getHistoryByOrder(ordId, connection);
  return order;
};

/**
 * Crear una nueva orden de trabajo.
 */
export const createWorkOrder = async ({ bikId, faultDescription, useBy }) => {
  if (!bikId) {
    const error = new Error("No se permite crear orden sin moto válida. bikId es requerido.");
    error.status = 400;
    throw error;
  }
  if (!faultDescription || !faultDescription.trim()) {
    const error = new Error("La descripción del fallo es obligatoria.");
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const bike = await executeQuery(
      `SELECT bik_id FROM tbl_bikes WHERE bik_id = $1 AND sta_id != 3 LIMIT 1`,
      [bikId],
      connection
    );
    if (!bike.length) {
      const error = new Error("No se permite crear orden sin moto válida. La moto no existe.");
      error.status = 400;
      throw error;
    }

    const insertResult = await executeQuery(
      `INSERT INTO tbl_work_orders (bik_id, ord_entry_date, ord_fault_description, ord_status, ord_total, ord_create_by, ord_update_by)
       VALUES ($1, NOW(), $2, $3, 0.00, $4, $5)
       RETURNING ord_id AS "ordId"`,
      [bikId, faultDescription.trim(), ORDER_STATUS.RECIBIDA, useBy, useBy],
      connection
    );

    const ordId = insertResult[0].ordId;

    await executeQuery(
      `INSERT INTO tbl_work_order_status_history (ord_id, his_from_status, his_to_status, his_note, use_id)
       VALUES ($1, NULL, $2, $3, $4)`,
      [ordId, ORDER_STATUS.RECIBIDA, "Creación de orden de trabajo en taller.", useBy],
      connection
    );

    await connection.query("COMMIT");

    return await getFullOrder(ordId, connection);
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

/**
 * Paginación de órdenes de trabajo con filtros de estado y placa.
 */
export const paginationWorkOrders = async ({
  status,
  plate,
  rows,
  first,
  sortField,
  sortOrder,
}) => {
  const order = sortOrder === 1 ? "ASC" : "DESC";
  let connection = null;
  try {
    connection = await getConnection();

    const whereConditions = [];
    if (status) whereConditions.push(`(o.ord_status = '${status}')`);
    if (plate) whereConditions.push(`(b.bik_plate LIKE '%${plate.toUpperCase()}%')`);

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const sortColumnMap = {
      ordId: "o.ord_id",
      entryDate: "o.ord_entry_date",
      status: "o.ord_status",
      total: "o.ord_total",
    };
    const sortColumn = sortColumnMap[sortField] || "o.ord_entry_date";

    const mainQuery = `
      SELECT ${ORDER_SELECT}
      ${ORDER_FROM}
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT ${Number(rows)} OFFSET ${Number(first)}
    `;

    const countQuery = `SELECT COUNT(DISTINCT o.ord_id) tot ${ORDER_FROM} ${whereClause}`;

    const results = await executeQuery(mainQuery, [], connection);
    const rowsc = await executeQuery(countQuery, [], connection);

    return { results: results.map(mapOrderRow), total: rowsc[0].tot };
  } finally {
    releaseConnection(connection);
  }
};

export const getWorkOrderById = async ({ ordId }) => {
  let connection = null;
  try {
    connection = await getConnection();
    const order = await getFullOrder(ordId, connection);
    if (!order) {
      const error = new Error(`Orden de trabajo con ID ${ordId} no encontrada.`);
      error.status = 404;
      throw error;
    }
    return order;
  } finally {
    releaseConnection(connection);
  }
};

export const getOrderHistory = async ({ ordId, userId }) => {
  let connection = null;
  try {
    connection = await getConnection();

    const order = await executeQuery(`SELECT ord_id FROM tbl_work_orders WHERE ord_id = $1`, [ordId], connection);
    if (!order.length) {
      const error = new Error(`Orden de trabajo con ID ${ordId} no encontrada.`);
      error.status = 404;
      throw error;
    }

    let history = await getHistoryByOrder(ordId, connection);
    if (userId) {
      history = history.filter((h) => String(h.useId) === String(userId));
    }

    return { total: history.length, data: history };
  } finally {
    releaseConnection(connection);
  }
};

/**
 * Cambiar el estado de una orden de trabajo, aplicando las reglas de negocio
 * de transición y de permisos (equivalentes a los roles ADMIN/MECANICO de la
 * app original, traducidos a permisos del módulo Taller).
 */
export const updateOrderStatus = async ({ ordId, nextStatus, note, useId }) => {
  if (!nextStatus) {
    const error = new Error("El parámetro toStatus (o status) es requerido en el cuerpo de la solicitud.");
    error.status = 400;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const orderRows = await executeQuery(
      `SELECT ord_status AS status FROM tbl_work_orders WHERE ord_id = $1 LIMIT 1`,
      [ordId],
      connection
    );

    if (!orderRows.length) {
      const error = new Error(`Orden de trabajo con ID ${ordId} no encontrada.`);
      error.status = 404;
      throw error;
    }

    const currentStatus = orderRows[0].status;

    if (currentStatus === nextStatus) {
      const error = new Error(`La orden ya se encuentra en el estado '${nextStatus}'.`);
      error.status = 400;
      throw error;
    }

    const canRevert = await userHasPermission(useId, TALLER_PERMISSIONS.ORDERS_REVERT);
    const canClose = await userHasPermission(useId, TALLER_PERMISSIONS.ORDERS_CLOSE);

    // Regla: si la orden está ENTREGADA, solo quien tenga permiso de "revertir" puede cambiarla.
    if (currentStatus === ORDER_STATUS.ENTREGADA && !canRevert) {
      const error = new Error(
        "No se puede cambiar el estado de una orden ENTREGADA. Solo un administrador puede revertirlo."
      );
      error.status = 400;
      throw error;
    }

    // Regla: solo quien tenga permiso "cerrar orden" puede pasar a ENTREGADA o CANCELADA.
    if ([ORDER_STATUS.ENTREGADA, ORDER_STATUS.CANCELADA].includes(nextStatus) && !canClose) {
      const error = new Error(
        `No tiene permiso para cambiar el estado a '${nextStatus}'. Solo un administrador puede cerrar o cancelar una orden.`
      );
      error.status = 403;
      throw error;
    }

    const isRevertingEntregada = currentStatus === ORDER_STATUS.ENTREGADA && canRevert;
    if (!isRevertingEntregada) {
      const validation = validateStatusTransition(currentStatus, nextStatus);
      if (!validation.valid) {
        const error = new Error(validation.message);
        error.status = 400;
        throw error;
      }
    }

    await executeQuery(
      `UPDATE tbl_work_orders SET ord_status = $1, ord_update_by = $2 WHERE ord_id = $3`,
      [nextStatus, useId, ordId],
      connection
    );

    await executeQuery(
      `INSERT INTO tbl_work_order_status_history (ord_id, his_from_status, his_to_status, his_note, use_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [ordId, currentStatus, nextStatus, note ? note.trim() : null, useId],
      connection
    );

    await connection.query("COMMIT");

    return await getFullOrder(ordId, connection);
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

const TERMINAL_STATUSES = [ORDER_STATUS.ENTREGADA, ORDER_STATUS.CANCELADA];

export const addOrderItem = async ({ ordId, type, description, count, unitValue }) => {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const orderRows = await executeQuery(
      `SELECT ord_status AS status FROM tbl_work_orders WHERE ord_id = $1 LIMIT 1`,
      [ordId],
      connection
    );

    if (!orderRows.length) {
      const error = new Error(`Orden de trabajo con ID ${ordId} no encontrada.`);
      error.status = 404;
      throw error;
    }

    if (TERMINAL_STATUSES.includes(orderRows[0].status)) {
      const error = new Error(`No se pueden agregar ítems a una orden en estado ${orderRows[0].status}.`);
      error.status = 400;
      throw error;
    }

    if (!type || !["MANO_OBRA", "REPUESTO"].includes(type)) {
      const error = new Error("El tipo de ítem debe ser 'MANO_OBRA' o 'REPUESTO'.");
      error.status = 400;
      throw error;
    }

    if (!description || !description.trim()) {
      const error = new Error("La descripción del ítem es obligatoria.");
      error.status = 400;
      throw error;
    }

    const countNum = parseInt(count, 10);
    if (isNaN(countNum) || countNum <= 0) {
      const error = new Error("La cantidad debe ser mayor a 0.");
      error.status = 400;
      throw error;
    }

    const valueNum = parseFloat(unitValue);
    if (isNaN(valueNum) || valueNum < 0) {
      const error = new Error("El valor unitario debe ser mayor o igual a 0.");
      error.status = 400;
      throw error;
    }

    const insertResult = await executeQuery(
      `INSERT INTO tbl_work_order_items (ord_id, item_type, item_description, item_count, item_unit_value)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING item_id AS "itemId"`,
      [ordId, type, description.trim(), countNum, valueNum.toFixed(2)],
      connection
    );

    await recalculateOrderTotal(ordId, connection);

    await connection.query("COMMIT");

    const order = await getFullOrder(ordId, connection);
    const newItem = order.items.find((i) => i.itemId === insertResult[0].itemId);

    return { item: newItem, workOrder: order };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};

export const deleteOrderItem = async ({ itemId, useId }) => {
  const canDelete = await userHasPermission(useId, TALLER_PERMISSIONS.ORDERS_DELETE_ITEM);
  if (!canDelete) {
    const error = new Error("Acceso denegado. Solo los administradores pueden eliminar ítems de una orden.");
    error.status = 403;
    throw error;
  }

  let connection = null;
  try {
    connection = await getConnection();
    await connection.query("BEGIN");

    const itemRows = await executeQuery(
      `SELECT ord_id AS "ordId" FROM tbl_work_order_items WHERE item_id = $1 LIMIT 1`,
      [itemId],
      connection
    );

    if (!itemRows.length) {
      const error = new Error(`Ítem con ID ${itemId} no encontrado.`);
      error.status = 404;
      throw error;
    }

    const ordId = itemRows[0].ordId;

    const orderRows = await executeQuery(
      `SELECT ord_status AS status FROM tbl_work_orders WHERE ord_id = $1 LIMIT 1`,
      [ordId],
      connection
    );

    if (orderRows.length && TERMINAL_STATUSES.includes(orderRows[0].status)) {
      const error = new Error(`No se pueden eliminar ítems de una orden en estado ${orderRows[0].status}.`);
      error.status = 400;
      throw error;
    }

    await executeQuery(`DELETE FROM tbl_work_order_items WHERE item_id = $1`, [itemId], connection);

    await recalculateOrderTotal(ordId, connection);

    await connection.query("COMMIT");

    const workOrder = await getFullOrder(ordId, connection);

    return { message: "Ítem eliminado con éxito.", workOrder };
  } catch (err) {
    if (connection) await connection.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    releaseConnection(connection);
  }
};
