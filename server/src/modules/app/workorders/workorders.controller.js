import * as workOrdersService from "./workorders.service.js";

export const createWorkOrderController = async (req, res, next) => {
  try {
    const { bikId, faultDescription } = req.body;
    const useBy = req.user.useId;
    const result = await workOrdersService.createWorkOrder({ bikId, faultDescription, useBy });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const paginationWorkOrdersController = async (req, res, next) => {
  try {
    const { status, plate, rows, first, sortField, sortOrder } = req.body;
    const result = await workOrdersService.paginationWorkOrders({
      status,
      plate,
      rows,
      first,
      sortField,
      sortOrder,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getWorkOrderByIdController = async (req, res, next) => {
  try {
    const { ordId } = req.query;
    const result = await workOrdersService.getWorkOrderById({ ordId });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getOrderHistoryController = async (req, res, next) => {
  try {
    const { ordId, userId } = req.query;
    const result = await workOrdersService.getOrderHistory({ ordId, userId });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatusController = async (req, res, next) => {
  try {
    const { ordId, toStatus, status, note } = req.body;
    const useId = req.user.useId;
    const result = await workOrdersService.updateOrderStatus({
      ordId,
      nextStatus: toStatus || status,
      note,
      useId,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const addOrderItemController = async (req, res, next) => {
  try {
    const { ordId, type, description, count, unitValue } = req.body;
    const result = await workOrdersService.addOrderItem({ ordId, type, description, count, unitValue });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteOrderItemController = async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const useId = req.user.useId;
    const result = await workOrdersService.deleteOrderItem({ itemId, useId });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};
