import sharp from 'sharp';

export const resizeToCardPhoto = async (inputPath: string, outputPath: string) => {
    await sharp(inputPath)
        .resize(600, 800, { fit: 'cover' })
        .toFile(outputPath);
};
