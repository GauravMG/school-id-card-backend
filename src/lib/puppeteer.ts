import puppeteer from 'puppeteer';

// Required on Linux servers to avoid sandbox privilege errors
const BROWSER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

export const generatePdfFromHtml = async (html: string, format: 'A3' | 'A4' | 'A5', outputPath: string) => {
    const browser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
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
 * Takes a PNG screenshot of a single ID card (323 × 204 px logical size) at 2×
 * device pixel ratio, yielding a 646 × 408 px output file suitable for display
 * and further PDF embedding.
 *
 * All images in the HTML must be base64 data URIs — Puppeteer's setContent() has
 * no server origin so /uploads/... src paths would 404.
 */
export const screenshotCardHtml = async (html: string, outputPath: string): Promise<void> => {
    const browser = await puppeteer.launch({ headless: true, args: BROWSER_ARGS });
    try {
        const page = await browser.newPage();
        // 2× DPR gives a crisp 646×408 px PNG from a 323×204 logical card
        await page.setViewport({ width: 323, height: 204, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    } finally {
        await browser.close();
    }
};
