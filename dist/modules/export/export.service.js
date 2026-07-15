"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSchoolStudentsPdf = void 0;
const prisma_1 = require("../../lib/prisma");
const ApiError_1 = require("../../utils/ApiError");
const id_card_layout_1 = require("../../utils/id-card-layout");
const template_renderer_1 = require("../../services/template-renderer");
const export_page_1 = require("../../templates/print/export-page");
const id_card_render_service_1 = require("../../services/id-card-render.service");
const client_1 = require("@prisma/client");
const exportSchoolStudentsPdf = async (schoolId, body) => {
    const school = await prisma_1.prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            logoFile: true,
            uniformBoyFile: true,
            uniformGirlFile: true
        }
    });
    if (!school)
        throw new ApiError_1.ApiError(404, 'School not found');
    const where = { schoolId };
    if (body.studentIds?.length) {
        where.id = { in: body.studentIds };
    }
    else if (body.filters) {
        if (body.filters.classValue)
            where.classValue = body.filters.classValue;
        if (body.filters.sectionValue)
            where.sectionValue = body.filters.sectionValue;
        if (body.filters.isDetailsCompleted !== undefined)
            where.isDetailsCompleted = body.filters.isDetailsCompleted;
    }
    const students = await prisma_1.prisma.student.findMany({
        where,
        include: {
            photoFile: true,
            compositeFile: true
        },
        orderBy: [{ classValue: 'asc' }, { sectionValue: 'asc' }, { rollNumber: 'asc' }]
    });
    const layout = (0, id_card_layout_1.getPdfLayout)(body.pageSize);
    const renderCard = await (0, template_renderer_1.getTemplateRenderer)(school.selectedTemplateId);
    const cardsHtml = students.map((student) => {
        const uniformUrl = student.gender === 'MALE'
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
    const fullHtml = (0, export_page_1.renderExportPageHtml)(cardsHtml, layout.columns);
    const pdf = await (0, id_card_render_service_1.renderCardsPdf)(fullHtml, body.pageSize);
    const fileAsset = await prisma_1.prisma.fileAsset.create({
        data: {
            originalName: pdf.fileName,
            mimeType: 'application/pdf',
            extension: 'pdf',
            size: pdf.size,
            path: pdf.path,
            publicUrl: pdf.publicUrl,
            category: client_1.UploadCategory.EXPORT_PDF
        }
    });
    return { pdf, fileAsset, count: students.length };
};
exports.exportSchoolStudentsPdf = exportSchoolStudentsPdf;
