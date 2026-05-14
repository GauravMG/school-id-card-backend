import { Router } from 'express';
import { exportSchoolPdfController } from '../modules/export/export.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { exportPdfSchema } from '../modules/export/export.schema';

const router = Router();

router.post('/schools/:schoolId/pdf', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), validate(exportPdfSchema), exportSchoolPdfController);

export default router;
