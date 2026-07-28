import * as usersService from "./users.service.js";

export const getUsersByPermision = async (req, res, next) => {
  try {
    const { perId } = req.body;
    const result = await usersService.getUsersByPermission({ perId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { proId } = req.query;
    const result = await usersService.getUsers({ proId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const paginationUsersController = async (req, res, next) => {
  try {
    const {
      useId,
      proId,
      name,
      lastName,
      email,
      identification,
      username,
      staId,
      rows,
      first,
      sortField,
      sortOrder,
    } = req.body;
    const result = await usersService.paginationUsers({
      useId,
      proId,
      name,
      lastName,
      email,
      identification,
      username,
      staId,
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

export const countUsersController = async (req, res, next) => {
  try {
    const { useId } = req.query;
    const result = await usersService.countUsers({ useId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const saveUserController = async (req, res, next) => {
  try {
    const {
      useId,
      proId,
      name,
      lastName,
      identification,
      username,
      email,
      password,
      access,
      staId,
      changePassword,
      ProfileMode,
      field,
      value,
      usePages,
    } = req.body;
    const useBy = req.user.useId;
    const result = await usersService.saveUser({
      useId,
      proId,
      name,
      lastName,
      identification,
      username,
      email,
      password,
      access,
      staId,
      useBy,
      changePassword,
      ProfileMode,
      field,
      value,
      usePages,
    });
    const statusCode = ProfileMode || useId > 0 ? 200 : 201;
    return res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const { useId } = req.body;
    const result = await usersService.deleteUser({ useId, updatedBy: req.user.useId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
