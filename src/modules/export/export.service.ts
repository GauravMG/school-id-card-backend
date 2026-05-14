import fs from 'fs';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { getPdfLayout } from '../../utils/id-card-layout';
import { getTemplateRenderer } from '../../services/template-renderer';
import { renderExportPageHtml } from '../../templates/print/export-page';
import { renderCardsPdf } from '../../services/id-card-render.service';
import { UploadCategory } from '@prisma/client';

export const exportSchoolStudentsPdf = async (schoolId: string, body: any) => {
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            logoFile: true,
            uniformBoyFile: true,
            uniformGirlFile: true
        }
    });

    if (!school) throw new ApiError(404, 'School not found');

    const where: any = { schoolId };

    if (body.studentIds?.length) {
        where.id = { in: body.studentIds };
    } else if (body.filters) {
        if (body.filters.classValue) where.classValue = body.filters.classValue;
        if (body.filters.sectionValue) where.sectionValue = body.filters.sectionValue;
        if (body.filters.isDetailsCompleted !== undefined) where.isDetailsCompleted = body.filters.isDetailsCompleted;
    }

    const students = await prisma.student.findMany({
        where,
        include: {
            photoFile: true,
            compositeFile: true
        },
        orderBy: [{ classValue: 'asc' }, { sectionValue: 'asc' }, { rollNumber: 'asc' }]
    });

    const layout = getPdfLayout(body.pageSize);
    const renderCard = await getTemplateRenderer(school.selectedTemplateId);

    const cardsHtml = students.map((student) => {
        const uniformUrl =
            student.gender === 'MALE'
                ? school.uniformBoyFile?.publicUrl
                : student.gender === 'FEMALE'
                    ? school.uniformGirlFile?.publicUrl
                    : undefined;

        return renderCard({
            school,
            student: {
                ...student,
                photoUrl: '',
                compositeUrl: student.compositeFile?.publicUrl ?? student.photoFile?.publicUrl ?? ''
            },
            uniformUrl: uniformUrl ?? ''
        });
    });

    const fullHtml = renderExportPageHtml(cardsHtml, layout.columns);
    const pdf = await renderCardsPdf(fullHtml, body.pageSize);

    const fileAsset = await prisma.fileAsset.create({
        data: {
            originalName: pdf.fileName,
            mimeType: 'application/pdf',
            extension: 'pdf',
            size: pdf.size,
            path: pdf.path,
            publicUrl: pdf.publicUrl,
            category: UploadCategory.EXPORT_PDF
        }
    });

    return { pdf, fileAsset, count: students.length };
};
