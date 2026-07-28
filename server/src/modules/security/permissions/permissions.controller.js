import * as permissionsService from "./permissions.service.js";

export const getProfileWindowsController = async (req, res, next) => {
  try {
    const { proId, useId } = req.query;
    const result = await permissionsService.getProfileWindows({ proId, useId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserPermissionsController = async (req, res, next) => {
  try {
    const { pagIds, useId } = req.body;
    const result = await permissionsService.getUserPermissions({ pagIds, useId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProfilePermissionsController = async (req, res, next) => {
  try {
    const { pagIds, proId } = req.body;
    const result = await permissionsService.getProfilePermissions({ pagIds, proId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateProfilePermissionsController = async (req, res, next) => {
  try {
    const { permissions, proId } = req.body;
    const result = await permissionsService.updateProfilePermissions({ permissions, proId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateUserPermissionsController = async (req, res, next) => {
  try {
    const { permissions, useId } = req.body;
    const result = await permissionsService.updateUserPermissions({ permissions, useId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllPagesController = async (_req, res, next) => {
  try {
    const result = await permissionsService.getAllPages();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
