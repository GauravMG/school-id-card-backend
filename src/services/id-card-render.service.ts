import fs from 'fs';
import path from 'path';
import { renderTemplateHtml } from '../templates/registry';
import { generatePdfFromHtml } from '../lib/puppeteer';
import { ensureDir } from '../utils/file';

ensureDir('uploads/exports');

export const renderSingleCardHtml = async (templateId: string, payload: any) => {
    return renderTemplateHtml(templateId, payload);
};

export const renderCardsPdf = async (html: string, format: 'A3' | 'A4' | 'A5') => {
    const fileName = `export-${Date.now()}.pdf`;
    const outputPath = path.join('uploads/exports', fileName);
    await generatePdfFromHtml(html, format, outputPath);
    return {
        path: outputPath,
        publicUrl: `/${outputPath.replace(/\\/g, '/')}`,
        fileName,
        size: fs.statSync(outputPath).size
    };
};
