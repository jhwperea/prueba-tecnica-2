import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  paginationModuleDocs,
  saveModuleDoc,
  deleteModuleDoc,
  getFileBlob,
  deleteTempFile,
} from "./document.controller.js";

const moduleDocsRoutes = express.Router();

// Paginación de documentos por módulo
moduleDocsRoutes.post("/pagination", verifyToken, paginationModuleDocs);

// Guardar (crear/editar) documento o carpeta
moduleDocsRoutes.post("/save", verifyToken, saveModuleDoc);

// Eliminar lógica (soft delete con recursividad si es carpeta)
moduleDocsRoutes.put("/delete", verifyToken, deleteModuleDoc);

// Obtener blob de archivo
moduleDocsRoutes.get("/blob", verifyToken, getFileBlob);

// Eliminar archivo temporal (sin auth si se usa desde cliente)
moduleDocsRoutes.delete("/temp/:filename", deleteTempFile);

export default moduleDocsRoutes;
