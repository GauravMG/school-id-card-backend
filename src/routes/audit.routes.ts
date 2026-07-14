import { Router } from 'express';
import { listAuditActionTypesController, listAuditLogsController } from '../modules/audit/audit.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/', requireAuth, allowRoles('SUPERADMIN'), listAuditLogsController);
router.get('/action-types', requireAuth, allowRoles('SUPERADMIN'), listAuditActionTypesController);

export default router;
