import { Router } from 'express';
import { createStudentController, importStudentsCsvController, listStudentsController, updateStudentController, uploadStudentPhotoController } from '../modules/students/student.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createStudentSchema, studentListQuerySchema, updateStudentSchema } from '../modules/students/student.schema';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/schools/:schoolId/students', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), validate(studentListQuerySchema), listStudentsController);
router.post('/schools/:schoolId/students', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), validate(createStudentSchema), createStudentController);
router.patch('/schools/:schoolId/students/:studentId', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), validate(updateStudentSchema), updateStudentController);
router.post('/schools/:schoolId/students/import-csv', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), upload.single('csv'), importStudentsCsvController);
router.post('/schools/:schoolId/students/:studentId/photo', upload.single('photo'), uploadStudentPhotoController);

export default router;
