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
exports.composeStudentUniformImage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const openai_1 = __importStar(require("openai"));
const file_1 = require("../utils/file");
(0, file_1.ensureDir)('uploads/rendered');
const CANVAS_W = 600;
const CANVAS_H = 800;
let openaiClient = null;
function getOpenAI() {
    if (!process.env.OPENAI_API_KEY)
        throw new Error('OPENAI_API_KEY is not configured');
    if (!openaiClient)
        openaiClient = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
}
function resolvePath(p) {
    return path_1.default.isAbsolute(p) ? p : path_1.default.join(process.cwd(), p);
}
/**
 * Converts any image format to PNG and writes it to a temp path.
 */
async function asPng(inputPath, tmpPath) {
    await (0, sharp_1.default)(inputPath).png().toFile(tmpPath);
}
/**
 * Sends the student photo and uniform image to gpt-image-1, which composites
 * them into a single portrait photo — student face is preserved exactly as-is,
 * uniform colours and design are preserved exactly as-is.
 *
 * Returns the Buffer of the generated PNG on success, throws on failure.
 */
async function callGptImage1(studentPngPath, uniformPngPath) {
    const openai = getOpenAI();
    const [studentFile, uniformFile] = await Promise.all([
        (0, openai_1.toFile)(fs_1.default.createReadStream(studentPngPath), 'student.png', { type: 'image/png' }),
        (0, openai_1.toFile)(fs_1.default.createReadStream(uniformPngPath), 'uniform.png', { type: 'image/png' }),
    ]);
    const prompt = 'This is a photo compositing task. Do NOT generate, redraw, or reimagine anything. ' +
        'You are given two reference images and must composite them together while preserving every pixel detail of both. ' +
        'Image 1 is the student portrait. ' +
        'RULE 1 — FACE IS SACRED: Every facial feature in the output must be identical to Image 1. ' +
        'Do not alter skin tone, eye shape, nose, lips, hair colour, hair style, face shape, or any other physical trait. ' +
        'The face must look like a direct copy-paste from Image 1, not a reinterpretation. ' +
        'Image 2 is the school uniform. ' +
        'RULE 2 — UNIFORM IS SACRED: Every detail of the uniform in the output must be identical to Image 2. ' +
        'Do not change colours, logos, text, stitching, buttons, collar style, or any design element. ' +
        'The uniform must look like a direct copy-paste from Image 2, not a reinterpretation. ' +
        'Your only task: position the face and head from Image 1 above the collar of Image 2 so the student appears to be ' +
        'naturally wearing the uniform. Show head and upper body. Use a clean, plain, light-coloured background.';
    const response = await openai.images.edit({
        model: 'gpt-image-1',
        image: [studentFile, uniformFile],
        prompt,
        n: 1,
        size: '1024x1536', // portrait orientation — closest to 600×800
    });
    const b64 = response.data[0]?.b64_json;
    if (!b64)
        throw new Error('gpt-image-1 returned no image data');
    return Buffer.from(b64, 'base64');
}
/**
 * Composites the student photo and school uniform into a 600×800 px portrait PNG
 * using gpt-image-1. The student's face is not altered in any way.
 *
 * Falls back to a plain student photo resize if no uniform is provided or if the
 * AI call fails.
 */
const composeStudentUniformImage = async (input) => {
    const outputPath = path_1.default.join('uploads/rendered', input.outputFileName);
    const ts = Date.now();
    const tmpStudent = path_1.default.join('uploads/rendered', `_tmp_s_${ts}.png`);
    const tmpUniform = path_1.default.join('uploads/rendered', `_tmp_u_${ts}.png`);
    try {
        if (input.uniformPath) {
            await Promise.all([
                asPng(resolvePath(input.studentPhotoPath), tmpStudent),
                asPng(resolvePath(input.uniformPath), tmpUniform),
            ]);
            const imageBuffer = await callGptImage1(tmpStudent, tmpUniform);
            // Crop/scale to the standard card canvas size
            await (0, sharp_1.default)(imageBuffer)
                .resize(CANVAS_W, CANVAS_H, { fit: 'cover', position: 'top' })
                .png()
                .toFile(outputPath);
            console.log('[composite] gpt-image-1 composite saved:', outputPath);
            return outputPath;
        }
    }
    catch (err) {
        console.error('[composite] gpt-image-1 failed, falling back to plain photo:', err.message);
    }
    finally {
        try {
            fs_1.default.unlinkSync(tmpStudent);
        }
        catch { }
        try {
            fs_1.default.unlinkSync(tmpUniform);
        }
        catch { }
    }
    // Fallback: no uniform, or AI failed — resize original photo to canvas
    await (0, sharp_1.default)(resolvePath(input.studentPhotoPath))
        .resize(CANVAS_W, CANVAS_H, { fit: 'cover', position: 'top' })
        .png()
        .toFile(outputPath);
    return outputPath;
};
exports.composeStudentUniformImage = composeStudentUniformImage;
