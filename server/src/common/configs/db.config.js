import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

// Verificación rápida de que las variables sí se están leyendo del .env
// (si esto imprime "undefined", el .env no se está cargando o no está en la ruta esperada)
console.log("DB config leída:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
});

// Crear el pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "",
  port: Number(process.env.DB_PORT) || 5432,
  max: 10, // máximo de conexiones en el pool (equivalente a connectionLimit)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // La mayoría de proveedores cloud de Postgres (Railway, Render, Supabase, etc.)
  // exigen SSL para conexiones externas. Si ves un error de tipo
  // "no encryption" / "self signed certificate", descomenta esto:
  // ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("Nueva conexión creada en el pool");
});

pool.on("error", (err) => {
  console.error("Error inesperado en un cliente inactivo del pool:", err);
});

// Función para obtener una conexión (cliente) del pool
const getConnection = async () => {
  try {
    const connection = await pool.connect();
    // console.log("Conexión obtenida del pool");
    return connection;
  } catch (error) {
    console.error("Error al obtener la conexión:", error);
    throw error;
  }
};

// Función para liberar una conexión
const releaseConnection = (connection) => {
  if (connection) {
    connection.release(); // Devuelve el cliente al pool
    // console.log("Conexión liberada al pool");
  }
};

// Función para probar la conexión
const testConnection = async () => {
  let connection;
  try {
    connection = await getConnection();
    console.log(`Conexión exitosa a la base de datos ${process.env.DB_NAME} en ${process.env.DB_HOST}`);
    await connection.query("SELECT 1"); // Prueba simple
  } catch (error) {
    console.error("Error en la prueba de conexión:", error);
  } finally {
    releaseConnection(connection);
  }
};

// Función para ejecutar una consulta
// Nota: pg usa placeholders posicionales $1, $2, ... en lugar de "?" como mysql2
const executeQuery = async (query, params = [], connection) => {
  let connectionDb = null;
  try {
    connectionDb = connection ? connection : await getConnection();
    const { rows } = await connectionDb.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    throw error;
  } finally {
    if (!connection && connectionDb) releaseConnection(connectionDb);
  }
};

export { pool, testConnection, getConnection, releaseConnection, executeQuery };
