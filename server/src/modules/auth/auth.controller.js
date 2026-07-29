import * as authService from "./auth.service.js";

export const loginController = async (req, res, next) => {
  try {
    const { usuario, clave, password } = req.body;
    const result = await authService.login({ usuario, clave, password });

    // Frontend y backend viven en dominios distintos (Railway), así que esto
    // es una cookie cross-site: con sameSite "Strict" el navegador NUNCA la
    // manda de vuelta en requests entre esos dos dominios. Para que la
    // cookie cross-site sea utilizable en absoluto, sameSite debe ser "None"
    // (y eso obliga a secure: true, exigido por los navegadores).
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("tokenTEMPLATE", result.token, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 86400000,
    });

    // El frontend NO puede leer una cookie que pertenece al dominio del
    // backend (aislamiento de cookies por dominio del navegador), así que
    // además del Set-Cookie, el token va también en el body de la
    // respuesta para que el cliente lo guarde y lo mande como
    // "Authorization: Bearer <token>" en cada request (ver httpCliente.js).
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { nombre, telefono, correo, usuario, clave } = req.body;
    const result = await authService.register({
      nombre,
      telefono,
      correo,
      usuario,
      clave,
    });
    return res.status(201).json({
      message: "Usuario registrado correctamente. Verifica tu correo.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const resendOtpCode = async (req, res, next) => {
  try {
    const { useId } = req.body;
    await authService.resendOtp({ useId });
    res
      .status(200)
      .json({ success: true, message: "Código reenviado correctamente." });
  } catch (err) {
    next(err);
  }
};

export const verifyOtpCode = async (req, res, next) => {
  try {
    const { useId, codigo } = req.body;
    await authService.verifyOtp({ useId, codigo });
    res.status(200).json({ success: true, message: "Verificación exitosa." });
  } catch (err) {
    next(err);
  }
};

export const getSettlementController = async (req, res, next) => {
  try {
    const { useId } = req.query;
    const result = await authService.getBasicInformation({ useId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateAccountController = async (req, res, next) => {
  try {
    const { name, lastName, username, email, useId } = req.body;
    await authService.updateAccount({ name, lastName, username, email, useId });
    return res
      .status(200)
      .json({ message: "Cuenta Modificada Correctamente" });
  } catch (err) {
    next(err);
  }
};

export const updatePasswordController = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, useId } = req.body;
    await authService.updatePassword({ currentPassword, newPassword, useId });
    return res
      .status(200)
      .json({ message: "Contraseña Actualizada Correctamente" });
  } catch (err) {
    next(err);
  }
};

export const getWindowsByProfileController = async (req, res, next) => {
  try {
    const { proId } = req.query;
    const result = await authService.getWindowsByProfile({ proId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const validateCodePasswordController = async (req, res, next) => {
  try {
    const { token, codeTemp } = req.body;
    await authService.validateCodePassword({ token, codeTemp });
    return res
      .status(200)
      .json({ success: true, message: "Código verificado." });
  } catch (error) {
    next(error);
  }
};

export const restorePasswordController = async (req, res, next) => {
  try {
    const { token, nuevaContrasena, codeTemp } = req.body;
    await authService.restorePassword({ token, nuevaContrasena, codeTemp });
    return res
      .status(200)
      .json({ success: true, message: "Contraseña actualizada con éxito." });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword({ email });
    return res.status(200).json({
      success: true,
      token: result.token,
      message: "Correo enviado.",
    });
  } catch (err) {
    next(err);
  }
};
