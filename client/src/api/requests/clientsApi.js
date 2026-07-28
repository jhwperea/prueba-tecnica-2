import httpCliente from '../services/httpCliente';

/**
 * Listado simple de clientes activos (para combos / socketDropdown)
 */
export const getClientsAPI = () => httpCliente.get('app/clients/get_clients');

/**
 * Obtener un cliente por ID, incluyendo sus motos registradas
 * @param {{ cliId: number }} params
 */
export const getClientAPI = (params) => httpCliente.get('app/clients/get_client', params);

/**
 * Paginación de clientes con filtros de búsqueda
 * @param {{ name, phone, email, rows, first, sortField, sortOrder }} params
 */
export const paginationClientsAPI = (params) => httpCliente.post('app/clients/list_clients', params);

/**
 * Crear o editar un cliente
 * @param {{ cliId, name, phone, email, staId }} params
 */
export const saveClientAPI = (params) => httpCliente.post('app/clients/save_client', params);

/**
 * Eliminar cliente (soft delete — cambia sta_id a 3)
 * @param {{ cliId: number }} params
 */
export const deleteClientAPI = (params) => httpCliente.put('app/clients/delete_client', params);
