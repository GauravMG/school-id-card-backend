import { Router } from 'express';
import { getPublicFormFieldsController, getPublicSchoolController, getStudentByRollController, submitPublicStudentController } from '../modules/public-submission/public.controller';
import { validate } from '../middlewares/validate.middleware';
import { getByRollSchema, submitPublicStudentSchema } from '../modules/public-submission/public.schema';

const router = Router();

router.get('/schools/:slug', getPublicSchoolController);
router.get('/schools/:slug/form-fields', getPublicFormFieldsController);
router.get('/schools/:slug/student', validate(getByRollSchema), getStudentByRollController);
router.post('/schools/:slug/student', validate(submitPublicStudentSchema), submitPublicStudentController);

export default router;
