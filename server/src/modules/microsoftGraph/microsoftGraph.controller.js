import * as microsoftGraphService from "./microsoftGraph.service.js";

export const getSitesDrive = async (req, res, next) => {
  try {
    const result = await microsoftGraphService.getSites();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserDrive = async (_, res, next) => {
  try {
    const result = await microsoftGraphService.getUsers();
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error loading SharePoint users" });
  }
};

export const getUnitsDrive = async (req, res, next) => {
  try {
    const { site } = req.query;
    const result = await microsoftGraphService.getUnits({ site });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getFoldersDrive = async (req, res, next) => {
  try {
    const { site, library, folder } = req.query;
    const result = await microsoftGraphService.getFolders({
      site,
      library,
      folder,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
