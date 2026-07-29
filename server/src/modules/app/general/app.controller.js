import * as appService from "./app.service.js";

export const getMenuController = async (req, res, next) => {
  try {
    const { per, idu } = req.query;
    const result = await appService.getMenu({ per, idu });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getProfilesController = async (_req, res, next) => {
  try {
    const result = await appService.getProfiles();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyTokenController = async (req, res, next) => {
  try {
    // La cookie "tokenTEMPLATE" solo existe si el navegador la manda de
    // vuelta al backend, pero frontend y backend están en dominios
    // distintos (Railway), así que esa cookie casi nunca llega. El cliente
    // manda el token real en el header Authorization (ver httpCliente.js),
    // igual que hace authjwt.middleware.js — replicamos el mismo fallback
    // aquí para no depender únicamente de la cookie.
    let token = req.cookies.tokenTEMPLATE;
    if (!token || token === "undefined" || token === "null") {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      }
    }
    const result = await appService.verifyToken(token);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserPermissionsController = async (req, res, next) => {
  try {
    const { useId } = req.query;
    const result = await appService.getUserPermissions({ useId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getStatusesByScope = async (req, res, next) => {
  try {
    const { scope, excludesKeys } = req.query;
    const result = await appService.getStatusesByScope({ scope, excludesKeys });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getModules = async (_req, res, next) => {
  try {
    const result = await appService.getModules();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
