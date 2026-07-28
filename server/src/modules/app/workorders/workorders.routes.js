import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  createWorkOrderController,
  paginationWorkOrdersController,
  getWorkOrderByIdController,
  getOrderHistoryController,
  updateOrderStatusController,
  addOrderItemController,
  deleteOrderItemController,
} from "./workorders.controller.js";

const workOrdersRoutes = express.Router();

workOrdersRoutes.post("/save_work_order", verifyToken, createWorkOrderController);
workOrdersRoutes.post("/list_work_orders", verifyToken, paginationWorkOrdersController);
workOrdersRoutes.get("/get_work_order", verifyToken, getWorkOrderByIdController);
workOrdersRoutes.get("/get_history", verifyToken, getOrderHistoryController);
workOrdersRoutes.put("/update_status", verifyToken, updateOrderStatusController);
workOrdersRoutes.post("/add_item", verifyToken, addOrderItemController);
workOrdersRoutes.put("/delete_item", verifyToken, deleteOrderItemController);

export default workOrdersRoutes;
