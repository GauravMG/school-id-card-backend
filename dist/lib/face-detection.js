"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCollarPosition = exports.detectHeadRegion = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const openai_1 = __importDefault(require("openai"));
const ALPHA_THRESHOLD = 15;
let openaiClient = null;
function getOpenAI() {
    if (!process.env.OPENAI_API_KEY)
        return null;
    if (!openaiClient)
        openaiClient = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
}
function readAsDataUrl(filePath) {
    const resolved = path_1.default.isAbsolute(filePath) ? filePath : path_1.default.join(process.cwd(), filePath);
    if (!fs_1.default.existsSync(resolved))
        return null;
    const buffer = fs_1.default.readFileSync(resolved);
    const ext = path_1.default.extname(resolved).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${buffer.toString('base64')}`;
}
/**
 * Uses GPT-4o-mini vision to locate just the face and head (top of head to chin,
 * NOT including shoulders) in a student photo.
 */
async function detectFaceWithAI(imagePath, imgW, imgH) {
    const openai = getOpenAI();
    if (!openai)
        return null;
    const dataUrl = readAsDataUrl(imagePath);
    if (!dataUrl)
        return null;
    const prompt = `Analyze this student photo for a school ID card.
Locate the person's face and head region.
Return ONLY a valid JSON object (no markdown, no explanation) with integer pixel fields:
{"x": <left>, "y": <top>, "width": <width>, "height": <height>}
The box should cover from the very top of the head down to just below the chin — include a small amount of neck but do NOT include shoulders.
Image dimensions: ${imgW}w × ${imgH}h pixels.
If no face is visible, return: null`;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 100,
            messages: [{
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
                        { type: 'text', text: prompt }
                    ]
                }]
        });
        const text = response.choices[0]?.message?.content?.trim() ?? '';
        if (text === 'null' || text === '')
            return null;
        const box = JSON.parse(text);
        if (typeof box.x !== 'number' || typeof box.y !== 'number' ||
            typeof box.width !== 'number' || typeof box.height !== 'number' ||
            box.width < 5 || box.height < 5)
            return null;
        return {
            x: Math.max(0, Math.round(box.x)),
            y: Math.max(0, Math.round(box.y)),
            width: Math.min(imgW - Math.max(0, Math.round(box.x)), Math.round(box.width)),
            height: Math.min(imgH - Math.max(0, Math.round(box.y)), Math.round(box.height))
        };
    }
    catch (err) {
        console.warn('[face-detection] AI detection failed:', err.message);
        return null;
    }
}
/**
 * Fallback: scans the alpha channel of a background-removed image and returns a
 * face-only bounding box (top ~38 % of the person's bounding box height).
 */
async function detectFaceAlpha(transparentBuffer, imgW, imgH) {
    const analysisW = Math.min(imgW, 600);
    const scaleX = imgW / analysisW;
    const analysisH = Math.round(imgH / scaleX);
    const scaleY = imgH / analysisH;
    const alphaBuffer = await (0, sharp_1.default)(transparentBuffer)
        .resize(analysisW, analysisH, { fit: 'fill' })
        .extractChannel('alpha')
        .raw()
        .toBuffer();
    const pixels = new Uint8Array(alphaBuffer);
    let topRow = analysisH, bottomRow = 0, leftCol = analysisW, rightCol = 0, found = false;
    for (let y = 0; y < analysisH; y++) {
        for (let x = 0; x < analysisW; x++) {
            if (pixels[y * analysisW + x] > ALPHA_THRESHOLD) {
                if (y < topRow)
                    topRow = y;
                if (y > bottomRow)
                    bottomRow = y;
                if (x < leftCol)
                    leftCol = x;
                if (x > rightCol)
                    rightCol = x;
                found = true;
            }
        }
    }
    if (!found)
        return null;
    const personTop = Math.round(topRow * scaleY);
    const personBottom = Math.round(bottomRow * scaleY);
    const personLeft = Math.round(leftCol * scaleX);
    const personRight = Math.round(rightCol * scaleX);
    const personH = personBottom - personTop;
    const personW = personRight - personLeft;
    if (personH < 10 || personW < 10)
        return null;
    // Face only: top 38 % of person height (head to chin, no shoulders)
    const faceH = Math.round(personH * 0.38);
    const padX = Math.round(personW * 0.08);
    const rawX = Math.max(0, personLeft - padX);
    const rawW = Math.min(imgW, personRight + padX) - rawX;
    // Cap width so crop stays portrait-shaped
    const clampedW = Math.min(rawW, Math.round(faceH * 1.1));
    const centreX = Math.round((personLeft + personRight) / 2);
    const finalX = Math.max(0, Math.min(imgW - clampedW, centreX - Math.round(clampedW / 2)));
    return {
        x: finalX,
        y: Math.max(0, personTop - Math.round(personH * 0.03)),
        width: clampedW,
        height: faceH
    };
}
/**
 * Detects the face/head region (chin to top of head, no shoulders) in a student photo.
 * Tries GPT-4o-mini vision first, falls back to alpha-channel analysis.
 */
const detectHeadRegion = async (transparentBuffer, imgW, imgH, originalImagePath) => {
    if (originalImagePath) {
        const aiBox = await detectFaceWithAI(originalImagePath, imgW, imgH);
        if (aiBox) {
            console.log('[face-detection] AI face detection succeeded');
            return aiBox;
        }
        console.warn('[face-detection] AI detection returned null, falling back to alpha-channel');
    }
    return detectFaceAlpha(transparentBuffer, imgW, imgH);
};
exports.detectHeadRegion = detectHeadRegion;
/**
 * Uses GPT-4o-mini to find where the collar/neckline sits in a uniform image,
 * returned as a pixel Y coordinate relative to canvasH.
 * Falls back to 28 % of canvas height if AI is unavailable or fails.
 */
const detectCollarPosition = async (uniformPath, canvasH) => {
    const defaultY = Math.round(canvasH * 0.28);
    const openai = getOpenAI();
    if (!openai)
        return defaultY;
    const dataUrl = readAsDataUrl(uniformPath);
    if (!dataUrl)
        return defaultY;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 50,
            messages: [{
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
                        { type: 'text', text: 'This is a school uniform shirt/top image. At what percentage of the image height (0 = very top, 100 = very bottom) is the collar or neckline? Return ONLY a single integer. If unclear, return 28.' }
                    ]
                }]
        });
        const text = response.choices[0]?.message?.content?.trim() ?? '';
        const pct = parseInt(text.replace(/\D/g, ''), 10);
        if (isNaN(pct) || pct < 5 || pct > 70)
            return defaultY;
        console.log(`[face-detection] Collar detected at ${pct}% of uniform height`);
        return Math.round(canvasH * (pct / 100));
    }
    catch (err) {
        console.warn('[face-detection] Collar detection failed:', err.message);
        return defaultY;
    }
};
exports.detectCollarPosition = detectCollarPosition;
