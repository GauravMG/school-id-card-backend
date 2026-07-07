import { Router } from 'express';
import {
    createSchoolController,
    getSchoolController,
    getSchoolFontsController,
    getSchoolFormFieldsController,
    listSchoolsController,
    updateSchoolController,
    updateSchoolFontsController,
    updateSchoolFormFieldsController
} from '../modules/schools/school.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSchoolSchema, updateSchoolSchema } from '../modules/schools/school.schema';

const router = Router();

router.get('/', requireAuth, allowRoles('SUPERADMIN'), listSchoolsController);
router.post('/', requireAuth, allowRoles('SUPERADMIN'), validate(createSchoolSchema), createSchoolController);
router.get('/:schoolId', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), getSchoolController);
router.patch('/:schoolId', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), validate(updateSchoolSchema), updateSchoolController);
router.get('/:schoolId/fonts', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), getSchoolFontsController);
router.put('/:schoolId/fonts', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), updateSchoolFontsController);
router.get('/:schoolId/form-fields', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), getSchoolFormFieldsController);
router.put('/:schoolId/form-fields', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), updateSchoolFormFieldsController);

export default router;
