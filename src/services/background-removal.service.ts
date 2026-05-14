import path from 'path';
import { pathToFileURL } from 'url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let removeBackgroundFn: ((input: any, config?: any) => Promise<Blob>) | null = null;

async function getRemoveBackground(): Promise<typeof removeBackgroundFn> {
    if (!removeBackgroundFn) {
        const mod = await import('@imgly/background-removal-node');
        removeBackgroundFn = mod.removeBackground;
    }
    return removeBackgroundFn;
}

/**
 * Removes the background from an image file and returns a transparent RGBA PNG buffer.
 * Passes a file:// URL so the package can detect format from the file extension/content.
 */
export const removeImageBackground = async (imagePath: string): Promise<Buffer> => {
    const removeBackground = await getRemoveBackground();
    if (!removeBackground) {
        throw new Error('background-removal-node module not available');
    }

    const fileUrl = pathToFileURL(path.resolve(imagePath)).href;

    const resultBlob = await removeBackground(fileUrl, {
        output: { format: 'image/png', quality: 1 }
    });
    const resultArrayBuffer = await resultBlob.arrayBuffer();
    return Buffer.from(resultArrayBuffer);
};
