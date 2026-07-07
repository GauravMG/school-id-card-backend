import { prisma } from '../../lib/prisma';
import { DEFAULT_FORM_FIELDS } from '../../config/constants';

export interface FormFieldConfig {
    fieldKey: string;
    label: string;
    isVisible: boolean;
    isRequired: boolean;
    sortOrder: number;
    locked: boolean;
}

export type FormFieldUpdate = Partial<Pick<FormFieldConfig, 'label' | 'isVisible' | 'isRequired' | 'sortOrder'>> & {
    fieldKey: string;
};

/**
 * Returns the effective field config for a school: DEFAULT_FORM_FIELDS
 * overridden by any SchoolFormField rows the school has customized. A school
 * with zero rows renders identically to the pre-Phase-7 hardcoded form.
 */
export const getSchoolFormFields = async (schoolId: string): Promise<FormFieldConfig[]> => {
    const rows = await prisma.schoolFormField.findMany({ where: { schoolId } });
    const byKey = new Map(rows.map((r) => [r.fieldKey, r]));

    return DEFAULT_FORM_FIELDS.map((def) => {
        const row = byKey.get(def.fieldKey);
        const locked = !!def.locked;
        return {
            fieldKey: def.fieldKey,
            label: row?.label ?? def.label,
            isVisible: locked ? true : row?.isVisible ?? def.isVisible,
            isRequired: locked ? true : row?.isRequired ?? def.isRequired,
            sortOrder: row?.sortOrder ?? def.sortOrder,
            locked
        };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const updateSchoolFormFields = async (
    schoolId: string,
    updates: FormFieldUpdate[]
): Promise<FormFieldConfig[]> => {
    const validKeys = new Map(DEFAULT_FORM_FIELDS.map((f) => [f.fieldKey, f]));

    const safeUpdates = updates.filter((u) => {
        const def = validKeys.get(u.fieldKey);
        return def && !def.locked;
    });

    await prisma.$transaction(
        safeUpdates.map((u) => {
            const def = validKeys.get(u.fieldKey)!;
            return prisma.schoolFormField.upsert({
                where: { schoolId_fieldKey: { schoolId, fieldKey: u.fieldKey } },
                create: {
                    schoolId,
                    fieldKey: u.fieldKey,
                    label: u.label ?? def.label,
                    isVisible: u.isVisible ?? def.isVisible,
                    isRequired: u.isRequired ?? def.isRequired,
                    sortOrder: u.sortOrder ?? def.sortOrder
                },
                update: {
                    ...(u.label !== undefined && { label: u.label }),
                    ...(u.isVisible !== undefined && { isVisible: u.isVisible }),
                    ...(u.isRequired !== undefined && { isRequired: u.isRequired }),
                    ...(u.sortOrder !== undefined && { sortOrder: u.sortOrder })
                }
            });
        })
    );

    return getSchoolFormFields(schoolId);
};

/**
 * Reduces a school's field config down to just the visible field keys,
 * for import flows (CSV/Excel) that should skip columns a school has hidden.
 */
export const getVisibleFieldKeys = async (schoolId: string): Promise<Set<string>> => {
    const fields = await getSchoolFormFields(schoolId);
    return new Set(fields.filter((f) => f.isVisible).map((f) => f.fieldKey));
};
