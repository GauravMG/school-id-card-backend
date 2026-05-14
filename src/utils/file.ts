import fs from 'fs';
import path from 'path';

export const ensureDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

export const fileUrl = (relativePath: string) => `/${relativePath.replace(/\\/g, '/')}`;

export const extFromMime = (mime: string) => {
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/png') return 'png';
    if (mime === 'image/webp') return 'webp';
    if (mime === 'text/csv') return 'csv';
    return path.extname(mime).replace('.', '') || 'bin';
};
