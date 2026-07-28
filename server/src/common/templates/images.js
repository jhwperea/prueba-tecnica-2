import fs from 'fs';
import path from 'path';

const imagesDir = path.join(import.meta.dirname, '../../assets/images');

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
