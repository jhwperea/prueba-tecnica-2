// Catálogo de estados de una orden de trabajo y matriz de transiciones válidas.
// Traducido 1:1 desde prueba-tecnica-pavas/backend/src/constants/orderStatus.js

export const ORDER_STATUS = {
  RECIBIDA: "RECIBIDA",
  DIAGNOSTICO: "DIAGNOSTICO",
  EN_PROCESO: "EN_PROCESO",
  LISTA: "LISTA",
  ENTREGADA: "ENTREGADA",
  CANCELADA: "CANCELADA",
};

export const VALID_TRANSITIONS = {
  [ORDER_STATUS.RECIBIDA]: [ORDER_STATUS.DIAGNOSTICO, ORDER_STATUS.CANCELADA],
  [ORDER_STATUS.DIAGNOSTICO]: [ORDER_STATUS.EN_PROCESO, ORDER_STATUS.CANCELADA],
  [ORDER_STATUS.EN_PROCESO]: [ORDER_STATUS.LISTA, ORDER_STATUS.CANCELADA],
  [ORDER_STATUS.LISTA]: [ORDER_STATUS.ENTREGADA, ORDER_STATUS.CANCELADA],
  [ORDER_STATUS.ENTREGADA]: [],
  [ORDER_STATUS.CANCELADA]: [],
};

/**
 * Valida si la transición de un estado origen a un estado destino es válida.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateStatusTransition = (currentStatus, nextStatus) => {
  if (!Object.values(ORDER_STATUS).includes(nextStatus)) {
    return {
      valid: false,
      message: `El estado '${nextStatus}' no es un estado válido en el sistema. Estados permitidos: ${Object.values(ORDER_STATUS).join(", ")}`,
    };
  }

  if (currentStatus === nextStatus) {
    return {
      valid: false,
      message: `La orden ya se encuentra en el estado '${currentStatus}'.`,
    };
  }

  if (currentStatus === ORDER_STATUS.ENTREGADA) {
    return {
      valid: false,
      message: `No se pueden realizar transiciones desde el estado final 'ENTREGADA'.`,
    };
  }

  if (currentStatus === ORDER_STATUS.CANCELADA) {
    return {
      valid: false,
      message: `No se pueden realizar transiciones desde una orden que ya ha sido 'CANCELADA'.`,
    };
  }

  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    return {
      valid: false,
      message: `Transición inválida de '${currentStatus}' a '${nextStatus}'. Transiciones permitidas desde '${currentStatus}': [${allowedNext.join(", ")}]`,
    };
  }

  return { valid: true };
};

// per_id sembrados en database/bdtemplate.sql para el módulo Taller (ver seed de tbl_permissions)
export const TALLER_PERMISSIONS = {
  CLIENTS_CREATE: 9,
  CLIENTS_EDIT: 10,
  CLIENTS_DELETE: 11,
  BIKES_CREATE: 12,
  BIKES_EDIT: 13,
  BIKES_DELETE: 14,
  ORDERS_CREATE: 15,
  ORDERS_ADD_ITEM: 16,
  ORDERS_DELETE_ITEM: 17,
  ORDERS_CLOSE: 18, // Cambiar a ENTREGADA o CANCELADA
  ORDERS_REVERT: 19, // Revertir estado desde ENTREGADA
};
