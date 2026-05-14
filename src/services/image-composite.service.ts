import path from 'path';
import sharp from 'sharp';
import { ensureDir } from '../utils/file';

ensureDir('uploads/rendered');

type CompositeInput = {
    studentPhotoPath: string;
    uniformPath?: string | null;
    outputFileName: string;
};

export const composeStudentUniformImage = async (input: CompositeInput) => {
    const outputPath = path.join('uploads/rendered', input.outputFileName);

    if (!input.uniformPath) {
        await sharp(input.studentPhotoPath).resize(600, 800, { fit: 'cover' }).toFile(outputPath);
        return outputPath;
    }

    const photoBuffer = await sharp(input.studentPhotoPath).resize(360, 420, { fit: 'cover' }).png().toBuffer();
    const base = sharp(input.uniformPath).resize(600, 800, { fit: 'cover' });

    await base
        .composite([{ input: photoBuffer, top: 70, left: 120 }])
        .png()
        .toFile(outputPath);

    return outputPath;
};
