import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import compressionMiddleware from "./src/common/middlewares/compression.middleware.js";
import cleanRequestData from "./src/common/middlewares/cleanRequestData.middleware.js";
import errorMiddleware from "./src/common/middlewares/error.middleware.js";
import mainRoutes from "./src/modules/main.routes.js";
import morgan from "morgan";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(morgan("dev"));

// ✅ CORS — antes de todo
// ✅ CORS — antes de todo
const allowedOrigins = [
  'http://localhost',
  'http://127.0.0.1',
  'https://pavastecnologia.com',
  'https://www.pavastecnologia.com',
  // Dominio del frontend en Railway. Si Railway te asigna otro dominio
  // (o lo regeneras), actualiza esto o exporta CLIENT_URL en las env vars
  // del servicio backend y se agrega automáticamente abajo.
  'https://frontend-production-804b.up.railway.app'
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.some((o) => origin.startsWith(o)) ||
      /\.up\.railway\.app$/.test(new URL(origin).hostname) // permite cualquier subdominio *.up.railway.app
    ) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por políticas de CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'currenuserapp', 'currentpermissionsuserapp']
}));


app.options('*', cors()); // ✅ preflight explícito

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compressionMiddleware);
app.use(cleanRequestData);
app.use(fileUpload({
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: true,
}));

app.use("/", express.static(path.join(__dirname, "../dist")));
app.use("/api", mainRoutes);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.use(errorMiddleware);

export { app };