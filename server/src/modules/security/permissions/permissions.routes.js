import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  getProfileWindowsController,
  getUserPermissionsController,
  getProfilePermissionsController,
  updateProfilePermissionsController,
  updateUserPermissionsController,
  getAllPagesController,
} from "./permissions.controller.js";

const permissionsRoutes = express.Router();

// RUTAS PRIVADAS
permissionsRoutes.get(
  "/get_windows_profile",
  verifyToken,
  getProfileWindowsController
);

permissionsRoutes.get(
  "/get_all_pages",
  verifyToken,
  getAllPagesController
);

permissionsRoutes.post(
  "/get_permissions_user_window",
  verifyToken,
  getUserPermissionsController
);

permissionsRoutes.post(
  "/get_permissions_profile",
  verifyToken,
  getProfilePermissionsController
);

permissionsRoutes.post(
  "/update_permissions_profile",
  verifyToken,
  updateProfilePermissionsController
);

permissionsRoutes.post(
  "/update_permissions_user",
  verifyToken,
  updateUserPermissionsController
);

export default permissionsRoutes;
