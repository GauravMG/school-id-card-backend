import puppeteer from 'puppeteer';

export const generatePdfFromHtml = async (html: string, format: 'A3' | 'A4' | 'A5', outputPath: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
        path: outputPath,
        format,
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    await browser.close();
};
