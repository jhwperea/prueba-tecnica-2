import * as templateService from "./template.service.js";

export const getMasterTemplate = async (_req, res, next) => {
  try {
    const result = await templateService.getMasterTemplates();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const paginationMasterTemplate = async (req, res, next) => {
  try {
    const { nombre, estado, rows, first, sortField, sortOrder } = req.body;
    const result = await templateService.paginationMasterTemplate({
      nombre,
      estado,
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

export const saveMasterTemplate = async (req, res, next) => {
  try {
    const { masId, nombre, estado, usureg, usuact } = req.body;
    const result = await templateService.saveMasterTemplate({
      masId,
      nombre,
      estado,
      usureg,
      usuact,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteMasterTemplate = async (req, res, next) => {
  try {
    const { masId, usuact } = req.body;
    const result = await templateService.deleteMasterTemplate({ masId, usuact });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
