import * as clientsService from "./clients.service.js";

export const getClientsController = async (_req, res, next) => {
  try {
    const result = await clientsService.getClients();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const paginationClientsController = async (req, res, next) => {
  try {
    const { name, phone, email, rows, first, sortField, sortOrder } = req.body;
    const result = await clientsService.paginationClients({
      name,
      phone,
      email,
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

export const getClientByIdController = async (req, res, next) => {
  try {
    const { cliId } = req.query;
    const result = await clientsService.getClientById({ cliId });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveClientController = async (req, res, next) => {
  try {
    const { cliId, name, phone, email, staId } = req.body;
    const useBy = req.user.useId;
    const result = await clientsService.saveClient({
      cliId,
      name,
      phone,
      email,
      staId,
      useBy,
    });
    const statusCode = cliId > 0 ? 200 : 201;
    return res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteClientController = async (req, res, next) => {
  try {
    const { cliId } = req.body;
    const result = await clientsService.deleteClient({
      cliId,
      updatedBy: req.user.useId,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
