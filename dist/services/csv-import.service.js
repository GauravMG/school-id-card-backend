"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importStudentsFromCsv = void 0;
const fs_1 = __importDefault(require("fs"));
const prisma_1 = require("../lib/prisma");
const csv_1 = require("../lib/csv");
const client_1 = require("@prisma/client");
const importStudentsFromCsv = async (schoolId, csvPath) => {
    const text = fs_1.default.readFileSync(csvPath, 'utf-8');
    const rows = (0, csv_1.parseCsvText)(text);
    const results = [];
    for (const row of rows) {
        const fullName = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
        const student = await prisma_1.prisma.student.upsert({
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
                status: client_1.StudentStatus.PHOTO_PENDING,
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
exports.importStudentsFromCsv = importStudentsFromCsv;
