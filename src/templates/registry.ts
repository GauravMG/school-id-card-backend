import { cardTemplate1 } from './html/card-template-1';
import { cardTemplate2 } from './html/card-template-2';
import { cardTemplate3 } from './html/card-template-3';
import { cardTemplate4 } from './html/card-template-4';
import { cardTemplate5 } from './html/card-template-5';
import { cardTemplate6 } from './html/card-template-6';
import { cardTemplate7 } from './html/card-template-7';
import { cardTemplate8 } from './html/card-template-8';
import { cardTemplate9 } from './html/card-template-9';
import { cardTemplate10 } from './html/card-template-10';

const registry: Record<string, (data: any) => string> = {
    'template-1': cardTemplate1,
    'template-2': cardTemplate2,
    'template-3': cardTemplate3,
    'template-4': cardTemplate4,
    'template-5': cardTemplate5,
    'template-6': cardTemplate6,
    'template-7': cardTemplate7,
    'template-8': cardTemplate8,
    'template-9': cardTemplate9,
    'template-10': cardTemplate10
};

export const renderTemplateHtml = (templateId: string, data: any) => {
    const renderer = registry[templateId] || registry['template-1'];
    return renderer(data);
};

export const getTemplateRegistry = () => Object.keys(registry);
