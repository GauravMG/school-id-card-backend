import fs from 'fs';
import { prisma } from '../lib/prisma';
import { parseCsvText } from '../lib/csv';
import { StudentStatus } from '@prisma/client';

type CsvStudentRow = {
    rollNumber: string;
    firstName: string;
    lastName?: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    classValue: string;
    sectionValue: string;
    fatherName?: string;
    motherName?: string;
    guardianPhone?: string;
    admissionNumber?: string;
    address?: string;
    stream?: 'ARTS' | 'COMMERCE' | 'SCIENCE_MEDICAL' | 'SCIENCE_NON_MEDICAL';
    commuteMode?: 'SELF' | 'WITH_PARENT' | 'SCHOOL_TRANSPORT';
};

export const importStudentsFromCsv = async (schoolId: string, csvPath: string) => {
    const text = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsvText<CsvStudentRow>(text);

    const results = [];

    for (const row of rows) {
        const fullName = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();

        const student = await prisma.student.upsert({
            where: {
                schoolId_rollNumber: {
                    schoolId,
                    rollNumber: row.rollNumber
                }
            },
            create: {
                schoolId,
                rollNumber: row.rollNumber,
                firstName: row.firstName,
                lastName: row.lastName || null,
                fullName,
                gender: row.gender,
                classValue: row.classValue,
                sectionValue: row.sectionValue,
                fatherName: row.fatherName || null,
                motherName: row.motherName || null,
                guardianPhone: row.guardianPhone || null,
                admissionNumber: row.admissionNumber || null,
                address: row.address || null,
                stream: row.stream || null,
                commuteMode: row.commuteMode || null,
                isImported: true,
                status: StudentStatus.PHOTO_PENDING,
                isDetailsCompleted: false
            },
            update: {
                firstName: row.firstName,
                lastName: row.lastName || null,
                fullName,
                gender: row.gender,
                classValue: row.classValue,
                sectionValue: row.sectionValue,
                fatherName: row.fatherName || null,
                motherName: row.motherName || null,
                guardianPhone: row.guardianPhone || null,
                admissionNumber: row.admissionNumber || null,
                address: row.address || null,
                stream: row.stream || null,
                commuteMode: row.commuteMode || null
            }
        });

        results.push(student);
    }

    return results;
};
