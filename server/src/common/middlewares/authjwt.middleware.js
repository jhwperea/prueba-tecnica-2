import {
  getConnection,
  releaseConnection,
  executeQuery,
} from "../../common/configs/db.config.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  let connection = null;
  try {
    connection = await getConnection();

    // Leer token de cookie o del header Authorization
    let token = req.cookies.tokenTEMPLATE;
    if (!token || token === "undefined" || token === "null") {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token || token === "undefined" || token === "null" || token === "") {
      return res.status(401).json({ message: "Autorización inválida" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "El token ha expirado" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Token inválido" });
        } else {
          return res.status(401).json({ message: "Error de autorización" });
        }
      }

      const rows = await executeQuery(
        `SELECT use_id FROM tbl_users WHERE use_id = $1 AND use_email = $2 AND sta_id = 1 LIMIT 1`,
        [decoded.useId, decoded.email],
        connection
      );

      if (rows.length > 0) {
        req.user = decoded;
        next();
      } else {
        return res.status(401).json({ message: "Autorización inválida" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  } finally {
    releaseConnection(connection);
  }
};
