import { UploadCategory } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { composeStudentUniformImage } from './image-composite.service';
import { generateStudentIdCard } from './id-card-generator.service';

/**
 * Runs the AI composite + ID card render for a student's already-saved photo
 * asset, then persists the resulting composite/card file references.
 *
 * This is the slow step (gpt-image-1 + Puppeteer) that used to run inline
 * inside the photo-upload request. It's now invoked exclusively by the
 * background job worker (see job-queue.service.ts) so uploads return fast and
 * the caller (public link or staff/bulk-import) doesn't block on it.
 */
export const processStudentPhotoJob = async (studentId: string, photoAssetId: string): Promise<void> => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            school: {
                include: { logoFile: true, uniformBoyFile: true, uniformGirlFile: true }
            }
        }
    });
    if (!student) throw new Error(`Student ${studentId} not found for photo processing`);

    const photoAsset = await prisma.fileAsset.findUnique({ where: { id: photoAssetId } });
    if (!photoAsset) throw new Error(`Photo asset ${photoAssetId} not found for photo processing`);

    const uniformPath =
        student.gender === 'MALE'
            ? student.school.uniformBoyFile?.path
            : student.gender === 'FEMALE'
                ? student.school.uniformGirlFile?.path
                : undefined;

    const compositePath = await composeStudentUniformImage({
        studentPhotoPath: photoAsset.path,
        uniformPath,
        outputFileName: `${student.id}-composite.png`
    });
    const compositePublicUrl = `/${compositePath.replace(/\\/g, '/')}`;

    const compositeAsset = await prisma.fileAsset.create({
        data: {
            originalName: `${student.fullName}-composite.png`,
            mimeType: 'image/png',
            extension: 'png',
            size: 0,
            path: compositePath,
            publicUrl: compositePublicUrl,
            category: UploadCategory.STUDENT_COMPOSITE
        }
    });

    let cardAsset: Awaited<ReturnType<typeof prisma.fileAsset.create>> | null = null;
    try {
        const cardResult = await generateStudentIdCard({
            student: {
                ...student,
                compositeFile: { path: compositePath, publicUrl: compositePublicUrl },
                photoFile: { path: photoAsset.path, publicUrl: photoAsset.publicUrl }
            },
            school: student.school,
            outputFileName: `${student.id}-card.png`
        });

        cardAsset = await prisma.fileAsset.create({
            data: {
                originalName: `${student.fullName}-id-card.png`,
                mimeType: 'image/png',
                extension: 'png',
                size: cardResult.size,
                path: cardResult.path,
                publicUrl: cardResult.publicUrl,
                category: UploadCategory.STUDENT_ID_CARD
            }
        });
    } catch (err) {
        // Card generation is best-effort; the composite is still saved either way
        console.error(`[processStudentPhotoJob] ID card generation failed for student ${studentId}:`, err);
    }

    await prisma.student.update({
        where: { id: student.id },
        data: {
            compositeFileId: compositeAsset.id,
            generatedCardFileId: cardAsset?.id ?? undefined
        }
    });
};
