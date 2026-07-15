"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extFromMime = exports.fileUrl = exports.ensureDir = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ensureDir = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath))
        fs_1.default.mkdirSync(dirPath, { recursive: true });
};
exports.ensureDir = ensureDir;
const fileUrl = (relativePath) => `/${relativePath.replace(/\\/g, '/')}`;
exports.fileUrl = fileUrl;
const extFromMime = (mime) => {
    if (mime === 'image/jpeg')
        return 'jpg';
    if (mime === 'image/png')
        return 'png';
    if (mime === 'image/webp')
        return 'webp';
    if (mime === 'text/csv')
        return 'csv';
    return path_1.default.extname(mime).replace('.', '') || 'bin';
};
exports.extFromMime = extFromMime;
