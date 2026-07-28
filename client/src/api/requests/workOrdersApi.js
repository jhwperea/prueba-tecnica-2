import httpCliente from '../services/httpCliente';

/**
 * Crear una nueva orden de trabajo
 * @param {{ bikId: number, faultDescription: string }} params
 */
export const createWorkOrderAPI = (params) => httpCliente.post('app/work-orders/save_work_order', params);

/**
 * Paginación de órdenes de trabajo con filtros de estado y placa
 * @param {{ status, plate, rows, first, sortField, sortOrder }} params
 */
export const paginationWorkOrdersAPI = (params) => httpCliente.post('app/work-orders/list_work_orders', params);

/**
 * Obtener el detalle completo de una orden (moto, cliente, ítems e historial)
 * @param {{ ordId: number }} params
 */
export const getWorkOrderAPI = (params) => httpCliente.get('app/work-orders/get_work_order', params);

/**
 * Obtener el historial de cambios de estado de una orden
 * @param {{ ordId: number, userId?: number }} params
 */
export const getOrderHistoryAPI = (params) => httpCliente.get('app/work-orders/get_history', params);

/**
 * Cambiar el estado de una orden de trabajo
 * @param {{ ordId: number, toStatus: string, note?: string }} params
 */
export const updateOrderStatusAPI = (params) => httpCliente.put('app/work-orders/update_status', params);

/**
 * Agregar un ítem (mano de obra o repuesto) a una orden
 * @param {{ ordId, type, description, count, unitValue }} params
 */
export const addOrderItemAPI = (params) => httpCliente.post('app/work-orders/add_item', params);

/**
 * Eliminar un ítem de una orden (solo administradores)
 * @param {{ itemId: number }} params
 */
export const deleteOrderItemAPI = (params) => httpCliente.put('app/work-orders/delete_item', params);
