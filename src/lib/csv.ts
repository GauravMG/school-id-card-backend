import { parse } from 'csv-parse/sync';

export const parseCsvText = <T = Record<string, string>>(text: string): T[] => {
    return parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    }) as T[];
};
