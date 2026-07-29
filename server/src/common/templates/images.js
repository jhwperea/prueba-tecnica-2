import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// import.meta.dirname requiere Node >= 20.11 / 21.2. En producción (Node 18)
// no existe y path.join(undefined, ...) revienta con ERR_INVALID_ARG_TYPE.
// fileURLToPath + path.dirname funciona en cualquier versión de Node con ESM.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../../assets/images');

const toDataUri = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  const mime = mimeTypes[ext] || 'image/png';
  const base64 = fs.readFileSync(filePath, 'base64');
  return `data:${mime};base64,${base64}`;
};

export const logoDoblamos = toDataUri(path.join(imagesDir, 'logo_doblamos.jpg'));
export const logoPavasStay = toDataUri(path.join(imagesDir, 'logoPavasStay.png'));
