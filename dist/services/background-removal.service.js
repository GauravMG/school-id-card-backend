"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeImageBackground = void 0;
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let removeBackgroundFn = null;
async function getRemoveBackground() {
    if (!removeBackgroundFn) {
        const mod = await Promise.resolve().then(() => __importStar(require('@imgly/background-removal-node')));
        removeBackgroundFn = mod.removeBackground;
    }
    return removeBackgroundFn;
}
/**
 * Removes the background from an image file and returns a transparent RGBA PNG buffer.
 * Passes a file:// URL so the package can detect format from the file extension/content.
 */
const removeImageBackground = async (imagePath) => {
    const removeBackground = await getRemoveBackground();
    if (!removeBackground) {
        throw new Error('background-removal-node module not available');
    }
    const fileUrl = (0, url_1.pathToFileURL)(path_1.default.resolve(imagePath)).href;
    const resultBlob = await removeBackground(fileUrl, {
        output: { format: 'image/png', quality: 1 }
    });
    const resultArrayBuffer = await resultBlob.arrayBuffer();
    return Buffer.from(resultArrayBuffer);
};
exports.removeImageBackground = removeImageBackground;
