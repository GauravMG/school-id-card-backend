import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { StudentStatus, UploadCategory } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { parseCsvText } from '../lib/csv';
import { saveFileAssetRecord } from './file-storage.service';
import { enqueuePhotoCompositeJob } from './job-queue.service';

/**
 * Sheet row expected from a photographer's roster: rollNumber, firstName,
 * class/section, gender, plus the exact filename of the photo they took for
 * that student. These are the same core identity fields required everywhere
 * else in the app (see DEFAULT_FORM_FIELDS "locked" fields) — the bulk
 * import intentionally doesn't support arbitrary extra columns.
 */
type SheetRow = {
    rollNumber?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    classValue?: string;
    sectionValue?: string;
    photoFileName?: string;
};

const parseSheet = (filePath: string): SheetRow[] => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.csv') {
        const text = fs.readFileSync(filePath, 'utf-8');
        return parseCsvText<SheetRow>(text);
    }
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<SheetRow>(sheet, { defval: '' });
};

export interface BulkPhotoImportResult {
    matched: Array<{ row: number; rollNumber: string; studentId: string; photoFileName: string }>;
    unmatchedPhoto: Array<{ row: number; rollNumber: string; photoFileName: string }>;
    invalidRows: Array<{ row: number; reason: string }>;
}

/**
 * Bulk-onboards students from a photographer's roster sheet + a batch of
 * photo files uploaded in the same request. For every valid, photo-matched
 * row this creates/updates the student exactly like the public link would,
 * then enqueues the same background composite/card-generation job used
 * everywhere else (see job-queue.service.ts) — no separate AI pipeline.
 */
export const importBulkPhotos = async (
    schoolId: string,
    sheetPath: string,
    photoFiles: Express.Multer.File[]
): Promise<BulkPhotoImportResult> => {
    const rows = parseSheet(sheetPath);
    const photoByName = new Map(photoFiles.map((f) => [f.originalname, f]));

    const result: BulkPhotoImportResult = { matched: [], unmatchedPhoto: [], invalidRows: [] };

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +1 for header row, +1 for 1-indexing

        const gender = (row.gender || '').toString().trim().toUpperCase();
        if (
            !row.rollNumber ||
            !row.firstName ||
            !row.classValue ||
            !row.sectionValue ||
            !['MALE', 'FEMALE', 'OTHER'].includes(gender)
        ) {
            result.invalidRows.push({ row: rowNumber, reason: 'Missing or invalid rollNumber/firstName/gender/classValue/sectionValue' });
            continue;
        }

        const photoFileName = (row.photoFileName || '').toString().trim();
        const photoFile = photoFileName ? photoByName.get(photoFileName) : undefined;
        if (!photoFile) {
            result.unmatchedPhoto.push({ row: rowNumber, rollNumber: String(row.rollNumber), photoFileName });
            continue;
        }

        const rollNumber = String(row.rollNumber).trim();
        const firstName = String(row.firstName).trim();
        const lastName = row.lastName ? String(row.lastName).trim() : null;
        const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
        const classValue = String(row.classValue).trim();
        const sectionValue = String(row.sectionValue).trim();

        const student = await prisma.student.upsert({
            where: { schoolId_rollNumber: { schoolId, rollNumber } },
            create: {
                schoolId,
                rollNumber,
                firstName,
                lastName,
                fullName,
                gender: gender as 'MALE' | 'FEMALE' | 'OTHER',
                classValue,
                sectionValue,
                isImported: true,
                status: StudentStatus.PHOTO_PENDING,
                isDetailsCompleted: false
            },
            update: { firstName, lastName, fullName, gender: gender as 'MALE' | 'FEMALE' | 'OTHER', classValue, sectionValue }
        });

        const photoAsset = await saveFileAssetRecord(photoFile, UploadCategory.STUDENT_PHOTO);

        await prisma.student.update({
            where: { id: student.id },
            data: { photoFileId: photoAsset.id, isDetailsCompleted: true, status: StudentStatus.COMPLETED }
        });

        await enqueuePhotoCompositeJob(student.id, photoAsset.id);

        result.matched.push({ row: rowNumber, rollNumber, studentId: student.id, photoFileName });
    }

    return result;
};
