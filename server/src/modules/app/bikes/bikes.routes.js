import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  searchBikesByPlateController,
  getBikesController,
  paginationBikesController,
  saveBikeController,
  deleteBikeController,
} from "./bikes.controller.js";

const bikesRoutes = express.Router();

// Búsqueda por placa (usada al crear una orden de trabajo)
bikesRoutes.get("/search_by_plate", verifyToken, searchBikesByPlateController);

bikesRoutes.get("/get_bikes", verifyToken, getBikesController);

bikesRoutes.post("/list_bikes", verifyToken, paginationBikesController);

// Abierta a cualquier usuario autenticado (registro rápido al crear una orden)
bikesRoutes.post("/save_bike", verifyToken, saveBikeController);

bikesRoutes.put("/delete_bike", verifyToken, deleteBikeController);

export default bikesRoutes;
