const errorMiddleware = (err, req, res, next) => {
  // Registrar el error para depuración
  console.error(`[ERROR]: ${err.stack || err.message}`);

  // **1. Manejo específico de errores de base de datos**
  if (err.code) {
    switch (err.code) {
      // ---- Códigos de mysql2 (legado, por si queda alguna ruta sin migrar) ----
      case "ER_WRONG_VALUE_COUNT_ON_ROW":
        return res.status(400).json({
          success: false,
          message:
            "El número de parámetros proporcionados no coincide con los esperados en la consulta. Contacta a sistemas.",
        });

      case "ER_BAD_NULL_ERROR":
        return res.status(400).json({
          success: false,
          message:
            "Uno o más parámetros obligatorios están vacíos. Contacta a sistemas.",
        });

      case "ER_NO_REFERENCED_ROW":
      case "ER_NO_REFERENCED_ROW_2":
        return res.status(400).json({
          success: false,
          message:
            "Violación de integridad referencial en la base de datos. Contacta a sistemas.",
        });

      case "ER_DUP_ENTRY":
        return res.status(409).json({
          success: false,
          message:
            "Intento de duplicar un valor único en la base de datos. Contacta a sistemas.",
        });

      case "ER_PARSE_ERROR":
        return res.status(400).json({
          success: false,
          message: "Error de sintaxis en la consulta SQL. Contacta a sistemas.",
        });

      case "ER_ACCESS_DENIED_ERROR":
        return res.status(403).json({
          success: false,
          message: "Acceso denegado a la base de datos. Contacta a sistemas.",
        });

      case "PROTOCOL_CONNECTION_LOST":
        return res.status(503).json({
          success: false,
          message:
            "Conexión con la base de datos perdida. Contacta a sistemas.",
        });

      case "ER_CON_COUNT_ERROR":
        return res.status(503).json({
          success: false,
          message:
            "Demasiadas conexiones abiertas con la base de datos. Contacta a sistemas.",
        });

      // ---- Códigos SQLSTATE de PostgreSQL (pg) ----
      case "23505": // unique_violation
        return res.status(409).json({
          success: false,
          message:
            "Intento de duplicar un valor único en la base de datos. Contacta a sistemas.",
        });

      case "23503": // foreign_key_violation
        return res.status(400).json({
          success: false,
          message:
            "Violación de integridad referencial en la base de datos. Contacta a sistemas.",
        });

      case "23502": // not_null_violation
        return res.status(400).json({
          success: false,
          message:
            "Uno o más parámetros obligatorios están vacíos. Contacta a sistemas.",
        });

      case "22P02": // invalid_text_representation (tipo de dato inválido)
        return res.status(400).json({
          success: false,
          message:
            "Uno o más parámetros tienen un formato inválido. Contacta a sistemas.",
        });

      case "42601": // syntax_error
      case "42703": // undefined_column
      case "42P01": // undefined_table
        return res.status(400).json({
          success: false,
          message: "Error de sintaxis en la consulta SQL. Contacta a sistemas.",
          ...(process.env.NODE_ENV !== "production" && { detail: err.message }),
        });

      case "28P01": // invalid_password
      case "28000": // invalid_authorization_specification
        return res.status(403).json({
          success: false,
          message: "Acceso denegado a la base de datos. Contacta a sistemas.",
        });

      case "3D000": // invalid_catalog_name (la base de datos no existe)
        return res.status(500).json({
          success: false,
          message: "La base de datos configurada no existe. Contacta a sistemas.",
        });

      case "08006": // connection_failure
      case "08001": // sqlclient_unable_to_establish_sqlconnection
        return res.status(503).json({
          success: false,
          message:
            "Conexión con la base de datos perdida. Contacta a sistemas.",
        });

      case "53300": // too_many_connections
        return res.status(503).json({
          success: false,
          message:
            "Demasiadas conexiones abiertas con la base de datos. Contacta a sistemas.",
        });

      default:
        // Si el error de base de datos no está controlado específicamente
        return res.status(500).json({
          success: false,
          message: `Error desconocido de base de datos. Contacta a sistemas.`,
          // En desarrollo, mostrar el código y mensaje real para poder depurar
          ...(process.env.NODE_ENV !== "production" && {
            code: err.code,
            detail: err.message,
          }),
        });
    }
  }

  // **2. Manejo de errores genéricos de Node.js**
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message:
        "El cuerpo de la solicitud contiene un error de sintaxis. Contacta a sistemas.",
    });
  }

  if (err.message && err.message.includes("Bind parameters")) {
    return res.status(400).json({
      success: false,
      message:
        "Faltan parámetros o contienen valores incorrectos para completar la consulta. Contacta a sistemas.",
    });
  }

  if (err.message && err.message.includes("ECONNREFUSED")) {
    return res.status(503).json({
      success: false,
      message: "Conexión rechazada al servidor. Contacta a sistemas.",
    });
  }

  if (err.message && err.message.includes("EADDRINUSE")) {
    return res.status(500).json({
      success: false,
      message: "El puerto del servidor ya está en uso. Contacta a sistemas.",
    });
  }

  if (err.message && err.message.includes("ENOTFOUND")) {
    return res.status(500).json({
      success: false,
      message: "No se pudo resolver un nombre de dominio. Contacta a sistemas.",
    });
  }

  // **3. Errores generales no previstos**
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      err.message || "Ha ocurrido un error inesperado. Contacta a sistemas.",
    // Mostrar detalles adicionales en desarrollo
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
