import { Router } from 'express';
import {
    listExportSettingsController,
    listActiveExportSettingsController,
    createExportSettingController,
    updateExportSettingController,
    deleteExportSettingController
} from '../modules/export-settings/export-setting.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/active', requireAuth, allowRoles('SUPERADMIN', 'SCHOOL_STAFF'), listActiveExportSettingsController);
router.get('/', requireAuth, allowRoles('SUPERADMIN'), listExportSettingsController);
router.post('/', requireAuth, allowRoles('SUPERADMIN'), createExportSettingController);
router.patch('/:id', requireAuth, allowRoles('SUPERADMIN'), updateExportSettingController);
router.delete('/:id', requireAuth, allowRoles('SUPERADMIN'), deleteExportSettingController);

export default router;
