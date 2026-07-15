"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveFile = exports.saveFileAssetRecord = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const saveFileAssetRecord = async (file, category) => {
    const publicPath = file.path.replace(/\\/g, '/');
    return prisma_1.prisma.fileAsset.create({
        data: {
            originalName: file.originalname,
            mimeType: file.mimetype,
            extension: path_1.default.extname(file.originalname).replace('.', ''),
            size: file.size,
            path: publicPath,
            publicUrl: `/${publicPath}`,
            category
        }
    });
};
exports.saveFileAssetRecord = saveFileAssetRecord;
const moveFile = (source, target) => {
    fs_1.default.renameSync(source, target);
    return target;
};
exports.moveFile = moveFile;
