import { Router } from 'express';
import { listTemplatesController } from '../modules/templates/template.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), listTemplatesController);

export default router;
