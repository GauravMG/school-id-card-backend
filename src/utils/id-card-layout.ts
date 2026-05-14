import { PDF_LAYOUTS } from '../config/constants';

export const getPdfLayout = (size: 'A3' | 'A4' | 'A5') => PDF_LAYOUTS[size];
