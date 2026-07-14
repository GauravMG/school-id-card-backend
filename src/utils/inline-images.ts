import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
};

/**
 * Reads an image file from disk and returns a base64 data URI string, or null if
 * the file doesn't exist. Used to embed images directly into Puppeteer HTML so that
 * no HTTP server is needed during screenshot/PDF rendering.
 */
function toBase64DataUri(filePath: string): string | null {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) return null;
    const buffer = fs.readFileSync(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mime = MIME_MAP[ext] ?? 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
}

/**
 * Replaces all src="/uploads/..." attributes in the rendered HTML with inline
 * base64 data URIs. Puppeteer's setContent() has no server origin, so relative
 * /uploads paths would 404; embedding the bytes directly avoids any network call.
 */
export function inlineUploadImages(html: string): string {
    return html.replace(/src="(\/uploads\/[^"]+)"/g, (_match, urlPath: string) => {
        const filePath = path.join(process.cwd(), urlPath);
        const dataUri = toBase64DataUri(filePath);
        return dataUri ? `src="${dataUri}"` : `src=""`;
    });
}
