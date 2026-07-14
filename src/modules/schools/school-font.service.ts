import { FontSlot } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { DEFAULT_FONT_ID, FONT_SLOTS } from '../../services/font-catalog';
import { SchoolFontMap } from '../../utils/inline-fonts';

/**
 * Returns the school's font choice for every slot, defaulting missing slots
 * to the system font — a school with no SchoolFontSetting rows at all (the
 * common case) renders exactly like before this feature existed.
 */
export const getSchoolFontMap = async (schoolId: string): Promise<SchoolFontMap> => {
    const rows = await prisma.schoolFontSetting.findMany({ where: { schoolId } });
    const map = Object.fromEntries(FONT_SLOTS.map((slot) => [slot, DEFAULT_FONT_ID])) as SchoolFontMap;
    for (const row of rows) map[row.slot] = row.fontFamily;
    return map;
};

export const updateSchoolFontMap = async (
    schoolId: string,
    updates: Partial<Record<FontSlot, string>>
): Promise<SchoolFontMap> => {
    const entries = Object.entries(updates).filter(([slot]) => (FONT_SLOTS as readonly string[]).includes(slot));

    await prisma.$transaction(
        entries.map(([slot, fontFamily]) =>
            prisma.schoolFontSetting.upsert({
                where: { schoolId_slot: { schoolId, slot: slot as FontSlot } },
                create: { schoolId, slot: slot as FontSlot, fontFamily: fontFamily as string },
                update: { fontFamily: fontFamily as string }
            })
        )
    );

    return getSchoolFontMap(schoolId);
};
