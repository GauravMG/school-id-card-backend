"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const file_1 = require("../utils/file");
(0, file_1.ensureDir)('uploads/schools');
(0, file_1.ensureDir)('uploads/students');
(0, file_1.ensureDir)('uploads/temp');
(0, file_1.ensureDir)('uploads/rendered');
(0, file_1.ensureDir)('uploads/exports');
const storage = multer_1.default.diskStorage({
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
        const ext = path_1.default.extname(file.originalname) || '';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
});
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const csvMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
exports.upload = (0, multer_1.default)({
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
