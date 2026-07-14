export const MASTER_CLASSES = [
    'NURSERY', 'LKG', 'UKG',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

export const MASTER_SECTIONS = ['A', 'B', 'C', 'D', 'E'];

export const TEMPLATE_IDS = Array.from({ length: 10 }, (_, i) => `template-${i + 1}`);

export const PDF_LAYOUTS = {
    A3: { cardsPerPage: 20, columns: 4, rows: 5 },
    A4: { cardsPerPage: 20, columns: 4, rows: 5 },
    A5: { cardsPerPage: 10, columns: 2, rows: 5 }
} as const;

// Standard printed photo size on the ID card: 1.2in x 1.3in.
// PHOTO_SOURCE_DPI is the working resolution for the AI-composited source
// image (independent of PRINT_DPI used for the sheet PDF export), chosen high
// enough that downscaling into any template's photo box stays crisp.
export const PHOTO_WIDTH_IN = 1.2;
export const PHOTO_HEIGHT_IN = 1.3;
export const PHOTO_SOURCE_DPI = 400;
export const PHOTO_CANVAS_WIDTH = Math.round(PHOTO_WIDTH_IN * PHOTO_SOURCE_DPI);
export const PHOTO_CANVAS_HEIGHT = Math.round(PHOTO_HEIGHT_IN * PHOTO_SOURCE_DPI);

// Card templates are laid out at 323x204 CSS px, which at the standard 96
// CSS-px-per-inch already maps to ~3.365in x 2.125in — almost exactly a
// CR80 ID card (3.375in x 2.125in), so the PDF export's page geometry
// (vector, unit-based) is already print-accurate. What raster quality
// actually needs is a higher-resolution PNG for the standalone card
// screenshot (used for on-screen preview / single-card download) — bumped
// here to a resolution matching Epson inkjet print quality (~300 DPI)
// instead of the old fixed 2x scale (~191 DPI).
export const CARD_LOGICAL_WIDTH_PX = 323;
export const CARD_LOGICAL_HEIGHT_PX = 204;
export const CARD_WIDTH_IN = 3.375;
export const PRINT_DPI = 300;
export const CARD_DEVICE_SCALE_FACTOR = Math.round(((CARD_WIDTH_IN * PRINT_DPI) / CARD_LOGICAL_WIDTH_PX) * 100) / 100;

/**
 * Default student form field set — mirrors the field list that used to be
 * hardcoded in student.schema.ts / the public link / the school portal.
 * A school with no SchoolFormField rows renders exactly this, so item 7
 * (per-school form customization) is fully backward compatible.
 *
 * `locked: true` fields are core identity fields required for student
 * lookups (unique roll number), status computation, and card generation —
 * schools can relabel them but can't hide or make them optional.
 */
export interface DefaultFormField {
    fieldKey: string;
    label: string;
    isVisible: boolean;
    isRequired: boolean;
    sortOrder: number;
    locked?: boolean;
}

export const DEFAULT_FORM_FIELDS: DefaultFormField[] = [
    { fieldKey: 'firstName', label: 'First Name', isVisible: true, isRequired: true, sortOrder: 1, locked: true },
    { fieldKey: 'lastName', label: 'Last Name', isVisible: true, isRequired: false, sortOrder: 2 },
    { fieldKey: 'rollNumber', label: 'Roll Number', isVisible: true, isRequired: true, sortOrder: 3, locked: true },
    { fieldKey: 'admissionNumber', label: 'Admission Number', isVisible: true, isRequired: false, sortOrder: 4 },
    { fieldKey: 'gender', label: 'Gender', isVisible: true, isRequired: true, sortOrder: 5, locked: true },
    { fieldKey: 'dateOfBirth', label: 'Date of Birth', isVisible: true, isRequired: false, sortOrder: 6 },
    { fieldKey: 'classValue', label: 'Class', isVisible: true, isRequired: true, sortOrder: 7, locked: true },
    { fieldKey: 'sectionValue', label: 'Section', isVisible: true, isRequired: true, sortOrder: 8, locked: true },
    { fieldKey: 'fatherName', label: "Father's Name", isVisible: true, isRequired: false, sortOrder: 9 },
    { fieldKey: 'motherName', label: "Mother's Name", isVisible: true, isRequired: false, sortOrder: 10 },
    { fieldKey: 'guardianPhone', label: 'Guardian Phone Number', isVisible: true, isRequired: false, sortOrder: 11 },
    { fieldKey: 'emergencyPhone', label: 'Emergency Phone Number', isVisible: true, isRequired: false, sortOrder: 12 },
    { fieldKey: 'address', label: 'Address', isVisible: true, isRequired: false, sortOrder: 13 },
    { fieldKey: 'bloodGroup', label: 'Blood Group', isVisible: true, isRequired: false, sortOrder: 14 },
    { fieldKey: 'transportRoute', label: 'Transport Route', isVisible: true, isRequired: false, sortOrder: 15 },
    { fieldKey: 'stream', label: 'Stream (Class 11/12)', isVisible: true, isRequired: false, sortOrder: 16 },
    { fieldKey: 'commuteMode', label: 'Commute Mode', isVisible: true, isRequired: false, sortOrder: 17 }
];
