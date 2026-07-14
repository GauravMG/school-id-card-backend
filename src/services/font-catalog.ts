/**
 * Curated, self-hosted font catalog for per-school card typography (items 10/11).
 * Deliberately small and backed by real font files already vendored as backend
 * dependencies (@fontsource/*) rather than a user-uploadable font-file system —
 * this keeps Puppeteer rendering fully offline (no network font loading, which
 * would undermine the Phase 2/3 performance work) and avoids the complexity of
 * validating/embedding arbitrary uploaded font files.
 */
export interface FontOption {
    id: string;
    label: string;
    cssFontFamily: string;
    /** Path to a .woff2 file (relative to backend project root), absent for the system default. */
    filePath?: string;
}

export const FONT_CATALOG: FontOption[] = [
    { id: 'system', label: 'System Default (Arial)', cssFontFamily: 'Arial, Helvetica, sans-serif' },
    {
        id: 'inter',
        label: 'Inter',
        cssFontFamily: "'Inter', Arial, sans-serif",
        filePath: 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2'
    },
    {
        id: 'poppins',
        label: 'Poppins',
        cssFontFamily: "'Poppins', Arial, sans-serif",
        filePath: 'node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2'
    },
    {
        id: 'roboto',
        label: 'Roboto',
        cssFontFamily: "'Roboto', Arial, sans-serif",
        filePath: 'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2'
    }
];

export const DEFAULT_FONT_ID = 'system';

export const FONT_SLOTS = ['HEADER', 'NAME', 'LABEL', 'BODY'] as const;
export type FontSlotName = (typeof FONT_SLOTS)[number];

export const getFontOption = (id: string): FontOption =>
    FONT_CATALOG.find((f) => f.id === id) ?? FONT_CATALOG[0];
