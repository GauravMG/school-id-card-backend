import puppeteer from 'puppeteer';
import { CARD_LOGICAL_WIDTH_PX, CARD_LOGICAL_HEIGHT_PX, CARD_DEVICE_SCALE_FACTOR } from '../config/constants';

// Required on Linux servers to avoid sandbox privilege errors
const BROWSER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

export const generatePdfFromHtml = async (html: string, format: 'A3' | 'A4' | 'A5', outputPath: string) => {
    const browser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.waitForSelector('html[data-fit-done="1"]', { timeout: 2000 }).catch(() => {});
        await page.pdf({
            path: outputPath,
            format,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });
    } finally {
        await browser.close();
    }
};

/**
 * Takes a PNG screenshot of a single ID card (323 × 204 px logical size) at a
 * device pixel ratio tuned to CARD_DEVICE_SCALE_FACTOR (~300 DPI at the
 * standard CR80 card width), yielding a print-quality output file suitable
 * for display, individual download, and Epson inkjet printing.
 *
 * All images in the HTML must be base64 data URIs — Puppeteer's setContent() has
 * no server origin so /uploads/... src paths would 404.
 */
export const screenshotCardHtml = async (html: string, outputPath: string): Promise<void> => {
    const browser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: CARD_LOGICAL_WIDTH_PX,
            height: CARD_LOGICAL_HEIGHT_PX,
            deviceScaleFactor: CARD_DEVICE_SCALE_FACTOR
        });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.waitForSelector('html[data-fit-done="1"]', { timeout: 2000 }).catch(() => {});
        await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    } finally {
        await browser.close();
    }
};
