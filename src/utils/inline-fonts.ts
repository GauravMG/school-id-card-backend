import fs from 'fs';
import path from 'path';
import { getFontOption, FontOption, FontSlotName } from '../services/font-catalog';

export type SchoolFontMap = Record<FontSlotName, string>;

const fontFaceCache = new Map<string, string>();

function buildFontFace(option: FontOption): string {
    if (!option.filePath) return '';
    const cached = fontFaceCache.get(option.id);
    if (cached !== undefined) return cached;

    const resolved = path.join(process.cwd(), option.filePath);
    let css = '';
    if (fs.existsSync(resolved)) {
        const b64 = fs.readFileSync(resolved).toString('base64');
        const familyName = option.cssFontFamily.split(',')[0].replace(/'/g, '').trim();
        css = `@font-face { font-family: '${familyName}'; src: url(data:font/woff2;base64,${b64}) format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }`;
    }
    fontFaceCache.set(option.id, css);
    return css;
}

/**
 * Injects per-school @font-face declarations (base64-embedded so Puppeteer's
 * setContent() can render them without a network fetch) and CSS custom
 * properties (--font-header/--font-name/--font-label/--font-body) that the
 * seeded templates reference. Font files are read once and cached in memory.
 */
export const injectSchoolFonts = (html: string, fonts: SchoolFontMap): string => {
    const entries = Object.entries(fonts) as [FontSlotName, string][];
    const options = entries.map(([, fontId]) => getFontOption(fontId));

    const faceCss = [...new Set(options.map(buildFontFace).filter(Boolean))].join('\n');
    const varsCss = `:root { ${entries
        .map(([slot, fontId]) => `--font-${slot.toLowerCase()}: ${getFontOption(fontId).cssFontFamily};`)
        .join(' ')} }`;
    const styleBlock = `<style>${faceCss}\n${varsCss}</style>`;

    return html.includes('</head>') ? html.replace('</head>', `${styleBlock}</head>`) : styleBlock + html;
};
