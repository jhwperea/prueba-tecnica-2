import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  getClientsController,
  paginationClientsController,
  getClientByIdController,
  saveClientController,
  deleteClientController,
} from "./clients.controller.js";

const clientsRoutes = express.Router();

// Listado simple para combos (usado por el registro rápido al crear una orden)
clientsRoutes.get("/get_clients", verifyToken, getClientsController);

clientsRoutes.get("/get_client", verifyToken, getClientByIdController);

clientsRoutes.post("/list_clients", verifyToken, paginationClientsController);

// Abierta a cualquier usuario autenticado: en la app original cualquier rol
// podía registrar un cliente nuevo (registro rápido al crear una orden).
clientsRoutes.post("/save_client", verifyToken, saveClientController);

clientsRoutes.put("/delete_client", verifyToken, deleteClientController);

export default clientsRoutes;
