import * as profilesService from "./profiles.service.js";
import { getIO } from "../../../common/configs/socket.manager.js";

export const paginationProfilesController = async (req, res, next) => {
  try {
    const { useId, name, staId, rows, first, sortField, sortOrder } = req.body;
    const result = await profilesService.paginationProfiles({
      useId,
      name,
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

export const getModulesController = async (req, res, next) => {
  try {
    const { proId } = req.query;
    const result = await profilesService.getModules({ proId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const saveProfileController = async (req, res, next) => {
  try {
    const { proId, name, staId, modules, previousModules } = req.body;
    const useId = req.user.useId;
    const result = await profilesService.saveProfile({
      proId,
      name,
      staId,
      modules,
      previousModules,
      useBy: useId,
    });

    getIO().emit("refresh-profiles", {});

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteProfileController = async (req, res, next) => {
  try {
    const { proId } = req.body;
    const result = await profilesService.deleteProfile({ proId, updatedBy: req.user.useId });

    getIO().emit("refresh-profiles", {});

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
