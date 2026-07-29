import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

// Verificación rápida de que las variables sí se están leyendo del .env
// (si esto imprime "undefined", el .env no se está cargando o no está en la ruta esperada)
console.log("DB config leída:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
});

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  // Railway (y la mayoría de proveedores cloud de MySQL) aceptan conexión sin SSL
  // por el puerto del proxy, pero si el error persiste probar con SSL:
  // ssl: { rejectUnauthorized: false },
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on("connection", () => {
  console.log("Nueva conexión creada en el pool");
});

// Función para obtener una conexión
const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
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
    connection.release(); // Devuelve la conexión al pool
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
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const sqlPath = path.join(__dirname, './database/generate.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await connection.query(sql);
    console.log("Archivo generate.sql ejecutado correctamente");
  } catch (error) {
    console.error("Error en la prueba de conexión:", error);
  } finally {
    releaseConnection(connection);
  }
};

// Función para ejecutar una consulta
const executeQuery = async (query, params = [], connection) => {
  let connectionDb = null;
  try {
    connectionDb = connection ? connection : await getConnection();
    const [results] = await connectionDb.execute(query, params);
    return results;
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    throw error;
  } finally {
    if (!connection && connectionDb) releaseConnection(connectionDb);
  }
};

export { pool, testConnection, getConnection, releaseConnection, executeQuery };
