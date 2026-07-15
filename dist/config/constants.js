"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDF_LAYOUTS = exports.TEMPLATE_IDS = exports.MASTER_SECTIONS = exports.MASTER_CLASSES = void 0;
exports.MASTER_CLASSES = [
    'NURSERY', 'LKG', 'UKG',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];
exports.MASTER_SECTIONS = ['A', 'B', 'C', 'D', 'E'];
exports.TEMPLATE_IDS = Array.from({ length: 10 }, (_, i) => `template-${i + 1}`);
exports.PDF_LAYOUTS = {
    A3: { cardsPerPage: 20, columns: 4, rows: 5 },
    A4: { cardsPerPage: 20, columns: 4, rows: 5 },
    A5: { cardsPerPage: 10, columns: 2, rows: 5 }
};
