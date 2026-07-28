import * as documentsService from "./document.service.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const paginationModuleDocs = async (req, res, next) => {
  try {
    const result = await documentsService.paginationModuleDocs(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveModuleDoc = async (req, res, next) => {
  try {
    const result = await documentsService.saveModuleDoc(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteModuleDoc = async (req, res, next) => {
  try {
    const result = await documentsService.deleteModuleDoc(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const generateUniqueIdentifier = () => {
  const date = new Date();
  return `${date.getTime()}`;
};

export const getFileBlob = async (req, res) => {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ message: "URL del archivo es requerida." });
  }

  const uniqueIdentifier = generateUniqueIdentifier();
  const url = new URL(fileUrl);
  const extension = path.extname(url.pathname).substring(1);
  const tempDir = path.join(__dirname, "../tempFiles");
  const tempFilePath = path.join(tempDir, `${uniqueIdentifier}.${extension}`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    res.status(500).json({ message: "Error al procesar el archivo." });
  }
};

export const deleteTempFile = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../tempFiles", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error al eliminar el archivo temporal:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar el archivo temporal." });
    }
    res.status(204).send();
  });
};
