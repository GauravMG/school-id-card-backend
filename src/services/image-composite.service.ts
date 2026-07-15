import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import OpenAI, { toFile } from 'openai';
import { ensureDir } from '../utils/file';
import { PHOTO_CANVAS_WIDTH, PHOTO_CANVAS_HEIGHT } from '../config/constants';

ensureDir('uploads/rendered');

const CANVAS_W = PHOTO_CANVAS_WIDTH;
const CANVAS_H = PHOTO_CANVAS_HEIGHT;

export type CompositeInput = {
    studentPhotoPath: string;
    uniformPath?: string | null;
    outputFileName: string;
};

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
    if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
}

function resolvePath(p: string): string {
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

/**
 * Converts any image format to PNG and writes it to a temp path.
 */
async function asPng(inputPath: string, tmpPath: string): Promise<void> {
    await sharp(inputPath).png().toFile(tmpPath);
}

/**
 * Sends the student photo and uniform image to gpt-image-1, which composites
 * them into a single portrait photo — student face is preserved exactly as-is,
 * uniform colours and design are preserved exactly as-is.
 *
 * Returns the Buffer of the generated PNG on success, throws on failure.
 */
async function callGptImage1(studentPngPath: string, uniformPngPath: string): Promise<Buffer> {
    const openai = getOpenAI();

    const [studentFile, uniformFile] = await Promise.all([
        toFile(fs.createReadStream(studentPngPath), 'student.png', { type: 'image/png' }),
        toFile(fs.createReadStream(uniformPngPath), 'uniform.png', { type: 'image/png' }),
    ]);

    const prompt =
        'This is a photo compositing task. Do NOT generate, redraw, or reimagine anything. ' +
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
        size: '1024x1536',   // portrait orientation — closest to 600×800
    });

    if (!response?.data) throw new Error('gpt-image-1 returned no image data');

    const b64 = response.data[0]?.b64_json;
    if (!b64) throw new Error('gpt-image-1 returned no image data');

    return Buffer.from(b64, 'base64');
}

/**
 * Composites the student photo and school uniform into a 600×800 px portrait PNG
 * using gpt-image-1. The student's face is not altered in any way.
 *
 * Falls back to a plain student photo resize if no uniform is provided or if the
 * AI call fails.
 */
export const composeStudentUniformImage = async (input: CompositeInput): Promise<string> => {
    const outputPath = path.join('uploads/rendered', input.outputFileName);
    const ts = Date.now();
    const tmpStudent = path.join('uploads/rendered', `_tmp_s_${ts}.png`);
    const tmpUniform = path.join('uploads/rendered', `_tmp_u_${ts}.png`);

    try {
        if (input.uniformPath) {
            await Promise.all([
                asPng(resolvePath(input.studentPhotoPath), tmpStudent),
                asPng(resolvePath(input.uniformPath), tmpUniform),
            ]);

            const imageBuffer = await callGptImage1(tmpStudent, tmpUniform);

            // Crop/scale to the standard card canvas size
            await sharp(imageBuffer)
                .resize(CANVAS_W, CANVAS_H, { fit: 'cover', position: 'top' })
                .png()
                .toFile(outputPath);

            console.log('[composite] gpt-image-1 composite saved:', outputPath);
            return outputPath;
        }
    } catch (err) {
        console.error('[composite] gpt-image-1 failed, falling back to plain photo:', (err as Error).message);
    } finally {
        try { fs.unlinkSync(tmpStudent); } catch {}
        try { fs.unlinkSync(tmpUniform); } catch {}
    }

    // Fallback: no uniform, or AI failed — resize original photo to canvas
    await sharp(resolvePath(input.studentPhotoPath))
        .resize(CANVAS_W, CANVAS_H, { fit: 'cover', position: 'top' })
        .png()
        .toFile(outputPath);

    return outputPath;
};
