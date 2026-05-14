import multer from 'multer';
import path from 'path';
import { ensureDir } from '../utils/file';

ensureDir('uploads/schools');
ensureDir('uploads/students');
ensureDir('uploads/temp');
ensureDir('uploads/rendered');
ensureDir('uploads/exports');

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        if (file.fieldname.includes('logo') || file.fieldname.includes('uniform')) {
            cb(null, 'uploads/schools');
            return;
        }
        if (file.fieldname.includes('photo') || file.fieldname.includes('csv')) {
            cb(null, 'uploads/temp');
            return;
        }
        cb(null, 'uploads/temp');
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
});

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const csvMimeTypes = ['text/csv', 'application/vnd.ms-excel'];

export const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (imageMimeTypes.includes(file.mimetype) || csvMimeTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error('Unsupported file type'));
    },
    limits: {
        fileSize: 8 * 1024 * 1024
    }
});
