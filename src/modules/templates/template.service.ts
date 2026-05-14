import { getTemplateRegistry } from '../../templates/registry';

export const listTemplates = async () => {
    return getTemplateRegistry().map((id) => ({
        id,
        name: id.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }));
};
