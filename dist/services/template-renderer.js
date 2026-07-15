"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateRenderer = getTemplateRenderer;
const prisma_1 = require("../lib/prisma");
/**
 * Compiles a template's HTML content (which contains ${...} expressions) into a
 * synchronous render function by wrapping it in a template-literal Function.
 *
 * Any backticks or backslashes in the stored HTML are escaped before wrapping so
 * they can't break the outer template literal. The resulting function accepts the
 * same `data` object used by all ID-card templates.
 */
function compile(htmlContent) {
    const safe = htmlContent
        .replace(/\\/g, '\\\\') // \ → \\ (preserve literal backslashes)
        .replace(/`/g, '\\`'); // ` → \` (prevent premature template-literal close)
    return new Function('data', 'return `' + safe + '`');
}
/**
 * Fetches the template from the DB and returns a compiled synchronous render
 * function. Falls back to the first active template when the requested ID is not
 * found, so card generation never hard-fails due to a stale selectedTemplateId.
 */
async function getTemplateRenderer(templateId) {
    let template = await prisma_1.prisma.cardTemplate.findFirst({
        where: { id: templateId, isActive: true }
    });
    if (!template) {
        console.warn(`[template-renderer] Template "${templateId}" not found, using first available`);
        template = await prisma_1.prisma.cardTemplate.findFirst({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    if (!template)
        throw new Error('No active card templates found in the database');
    return compile(template.htmlContent);
}
