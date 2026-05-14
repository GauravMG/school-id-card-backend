import { Router } from 'express';
import { createStaffController, listStaffController, updateStaffController } from '../modules/staff/staff.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createStaffSchema, updateStaffSchema } from '../modules/staff/staff.schema';

const router = Router();

router.get('/schools/:schoolId/staff', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), listStaffController);
router.post('/schools/:schoolId/staff', requireAuth, allowRoles('SUPERADMIN'), validate(createStaffSchema), createStaffController);
router.patch('/schools/:schoolId/staff/:staffId', requireAuth, allowRoles('SUPERADMIN'), validate(updateStaffSchema), updateStaffController);

export default router;
