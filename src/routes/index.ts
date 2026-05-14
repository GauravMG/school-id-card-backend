import { Router } from 'express';
import authRoutes from './auth.routes';
import schoolRoutes from './school.routes';
import staffRoutes from './staff.routes';
import studentRoutes from './student.routes';
import publicRoutes from './public.routes';
import uploadRoutes from './upload.routes';
import templateRoutes from './template.routes';
import exportRoutes from './export.routes';
import auditRoutes from './audit.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/staff', staffRoutes);
router.use('/students', studentRoutes);
router.use('/public', publicRoutes);
router.use('/uploads', uploadRoutes);
router.use('/templates', templateRoutes);
router.use('/exports', exportRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
