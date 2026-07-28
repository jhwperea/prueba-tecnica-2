import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  getUsers,
  paginationUsersController,
  countUsersController,
  saveUserController,
  deleteUserController,
  getUsersByPermision,
} from "./users.controller.js";

const usersRoutes = express.Router();

usersRoutes.get("/get_users", verifyToken, getUsers);
usersRoutes.post("/get_users_permision", verifyToken, getUsersByPermision); 
usersRoutes.post("/list_users", verifyToken, paginationUsersController);
usersRoutes.get("/count_users", verifyToken, countUsersController);
usersRoutes.post("/save_user", verifyToken, saveUserController);
usersRoutes.put("/delete_user", verifyToken, deleteUserController);

export default usersRoutes;
