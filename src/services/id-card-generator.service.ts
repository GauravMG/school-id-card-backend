import fs from 'fs';
import path from 'path';
import { getTemplateRenderer } from './template-renderer';
import { screenshotCardHtml } from '../lib/puppeteer';
import { ensureDir } from '../utils/file';

ensureDir('uploads/rendered');

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
 * no HTTP server is needed during screenshot rendering.
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
function inlineUploadImages(html: string): string {
    return html.replace(/src="(\/uploads\/[^"]+)"/g, (_match, urlPath: string) => {
        const filePath = path.join(process.cwd(), urlPath);
        const dataUri = toBase64DataUri(filePath);
        return dataUri ? `src="${dataUri}"` : `src=""`;
    });
}

export interface CardGeneratorInput {
    student: {
        id: string;
        fullName: string;
        rollNumber: string;
        classValue: string;
        sectionValue: string;
        gender: string;
        fatherName?: string | null;
        motherName?: string | null;
        guardianPhone?: string | null;
        dateOfBirth?: Date | null;
        bloodGroup?: string | null;
        admissionNumber?: string | null;
        address?: string | null;
        compositeFile?: { path: string; publicUrl: string } | null;
        photoFile?: { path: string; publicUrl: string } | null;
        // Allow any additional Prisma fields
        [key: string]: unknown;
    };
    school: {
        name: string;
        brandColor: string;
        secondaryColor?: string | null;
        address: string;
        phone: string;
        selectedTemplateId: string;
        logoFile?: { path: string; publicUrl: string } | null;
        uniformBoyFile?: { path: string; publicUrl: string } | null;
        uniformGirlFile?: { path: string; publicUrl: string } | null;
        // Allow any additional Prisma fields
        [key: string]: unknown;
    };
    outputFileName: string;
}

/**
 * Renders the school's selected ID card template as a PNG screenshot.
 *
 * Images (composite, logo, uniform thumbnail) are embedded as base64 data URIs
 * so Puppeteer can render them without requiring a live HTTP server.
 */
export const generateStudentIdCard = async (
    input: CardGeneratorInput
): Promise<{ path: string; publicUrl: string; size: number }> => {
    const outputPath = path.join('uploads/rendered', input.outputFileName);

    const { student, school } = input;

    const uniformFile =
        student.gender === 'MALE'
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

    const renderCard = await getTemplateRenderer(school.selectedTemplateId);
    let html = renderCard(templateData);
    html = inlineUploadImages(html);

    await screenshotCardHtml(html, outputPath);

    const stat = fs.statSync(outputPath);
    return {
        path: outputPath,
        publicUrl: `/${outputPath.replace(/\\/g, '/')}`,
        size: stat.size
    };
};
