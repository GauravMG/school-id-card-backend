"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudentIdCard = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const template_renderer_1 = require("./template-renderer");
const puppeteer_1 = require("../lib/puppeteer");
const file_1 = require("../utils/file");
(0, file_1.ensureDir)('uploads/rendered');
const MIME_MAP = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
};
/**
 * Reads an image file from disk and returns a base64 data URI string, or null if
 * the file doesn't exist. Used to embed images directly into Puppeteer HTML so that
 * no HTTP server is needed during screenshot rendering.
 */
function toBase64DataUri(filePath) {
    const resolved = path_1.default.isAbsolute(filePath) ? filePath : path_1.default.join(process.cwd(), filePath);
    if (!fs_1.default.existsSync(resolved))
        return null;
    const buffer = fs_1.default.readFileSync(resolved);
    const ext = path_1.default.extname(resolved).toLowerCase();
    const mime = MIME_MAP[ext] ?? 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
}
/**
 * Replaces all src="/uploads/..." attributes in the rendered HTML with inline
 * base64 data URIs. Puppeteer's setContent() has no server origin, so relative
 * /uploads paths would 404; embedding the bytes directly avoids any network call.
 */
function inlineUploadImages(html) {
    return html.replace(/src="(\/uploads\/[^"]+)"/g, (_match, urlPath) => {
        const filePath = path_1.default.join(process.cwd(), urlPath);
        const dataUri = toBase64DataUri(filePath);
        return dataUri ? `src="${dataUri}"` : `src=""`;
    });
}
/**
 * Renders the school's selected ID card template as a PNG screenshot.
 *
 * Images (composite, logo, uniform thumbnail) are embedded as base64 data URIs
 * so Puppeteer can render them without requiring a live HTTP server.
 */
const generateStudentIdCard = async (input) => {
    const outputPath = path_1.default.join('uploads/rendered', input.outputFileName);
    const { student, school } = input;
    const uniformFile = student.gender === 'MALE'
        ? school.uniformBoyFile
        : student.gender === 'FEMALE'
            ? school.uniformGirlFile
            : null;
    const templateData = {
        school: {
            ...school,
            logoUrl: school.logoFile?.publicUrl ?? ''
        },
        student: {
            ...student,
            // Always use composite (head + uniform) on the card; fall back to original only if no composite exists
            photoUrl: '',
            compositeUrl: student.compositeFile?.publicUrl ?? student.photoFile?.publicUrl ?? ''
        },
        uniformUrl: uniformFile?.publicUrl ?? ''
    };
    const renderCard = await (0, template_renderer_1.getTemplateRenderer)(school.selectedTemplateId);
    let html = renderCard(templateData);
    html = inlineUploadImages(html);
    await (0, puppeteer_1.screenshotCardHtml)(html, outputPath);
    const stat = fs_1.default.statSync(outputPath);
    return {
        path: outputPath,
        publicUrl: `/${outputPath.replace(/\\/g, '/')}`,
        size: stat.size
    };
};
exports.generateStudentIdCard = generateStudentIdCard;
