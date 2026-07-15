"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeToCardPhoto = void 0;
const sharp_1 = __importDefault(require("sharp"));
const resizeToCardPhoto = async (inputPath, outputPath) => {
    await (0, sharp_1.default)(inputPath)
        .resize(600, 800, { fit: 'cover' })
        .toFile(outputPath);
};
exports.resizeToCardPhoto = resizeToCardPhoto;
