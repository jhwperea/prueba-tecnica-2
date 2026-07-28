import * as bikesService from "./bikes.service.js";

export const searchBikesByPlateController = async (req, res, next) => {
  try {
    const { plate } = req.query;
    const result = await bikesService.searchBikesByPlate({ plate });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBikesController = async (_req, res, next) => {
  try {
    const result = await bikesService.getBikes();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const paginationBikesController = async (req, res, next) => {
  try {
    const { plate, brand, cliId, rows, first, sortField, sortOrder } = req.body;
    const result = await bikesService.paginationBikes({
      plate,
      brand,
      cliId,
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

export const saveBikeController = async (req, res, next) => {
  try {
    const { bikId, plate, brand, model, cylinder, cliId, staId } = req.body;
    const useBy = req.user.useId;
    const result = await bikesService.saveBike({
      bikId,
      plate,
      brand,
      model,
      cylinder,
      cliId,
      staId,
      useBy,
    });
    const statusCode = bikId > 0 ? 200 : 201;
    return res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteBikeController = async (req, res, next) => {
  try {
    const { bikId } = req.body;
    const result = await bikesService.deleteBike({
      bikId,
      updatedBy: req.user.useId,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
