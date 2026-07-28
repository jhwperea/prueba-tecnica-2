import httpCliente from '../services/httpCliente';

/**
 * Búsqueda de motos por placa (coincidencia parcial), con datos del cliente.
 * Usado en el flujo de creación de una orden de trabajo.
 * @param {{ plate: string }} params
 */
export const searchBikesByPlateAPI = (params) => httpCliente.get('app/bikes/search_by_plate', params);

/**
 * Listado simple de motos activas (para combos)
 */
export const getBikesAPI = () => httpCliente.get('app/bikes/get_bikes');

/**
 * Paginación de motos con filtros de búsqueda
 * @param {{ plate, brand, cliId, rows, first, sortField, sortOrder }} params
 */
export const paginationBikesAPI = (params) => httpCliente.post('app/bikes/list_bikes', params);

/**
 * Crear o editar una moto
 * @param {{ bikId, plate, brand, model, cylinder, cliId, staId }} params
 */
export const saveBikeAPI = (params) => httpCliente.post('app/bikes/save_bike', params);

/**
 * Eliminar moto (soft delete — cambia sta_id a 3)
 * @param {{ bikId: number }} params
 */
export const deleteBikeAPI = (params) => httpCliente.put('app/bikes/delete_bike', params);
