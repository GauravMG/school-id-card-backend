import { Router } from 'express';
import { createSchoolController, getSchoolController, listSchoolsController, updateSchoolController } from '../modules/schools/school.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSchoolSchema, updateSchoolSchema } from '../modules/schools/school.schema';

const router = Router();

router.get('/', requireAuth, allowRoles('SUPERADMIN'), listSchoolsController);
router.post('/', requireAuth, allowRoles('SUPERADMIN'), validate(createSchoolSchema), createSchoolController);
router.get('/:schoolId', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), getSchoolController);
router.patch('/:schoolId', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), validate(updateSchoolSchema), updateSchoolController);

export default router;
