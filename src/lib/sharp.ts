import sharp from 'sharp';
import { PHOTO_CANVAS_WIDTH, PHOTO_CANVAS_HEIGHT } from '../config/constants';

export const resizeToCardPhoto = async (inputPath: string, outputPath: string) => {
    await sharp(inputPath)
        .resize(PHOTO_CANVAS_WIDTH, PHOTO_CANVAS_HEIGHT, { fit: 'cover' })
        .toFile(outputPath);
};
