import { Router } from 'express';
import { listAuditLogsController } from '../modules/audit/audit.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/', requireAuth, allowRoles('SUPERADMIN'), listAuditLogsController);

export default router;
