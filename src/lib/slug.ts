import { v4 as uuidv4 } from 'uuid';

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const uniqueSlug = (name: string): string => {
    const base = slugify(name) || 'school';
    const suffix = uuidv4().split('-')[0];
    return `${base}-${suffix}`;
};
