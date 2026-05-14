import { Router } from 'express';
import { loginController, logoutController, meController, refreshController, loginAsController, returnToAdminController } from '../modules/auth/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, loginAsSchema } from '../modules/auth/auth.schema';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.post('/login', validate(loginSchema), loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);

router.post(
    '/login-as',
    requireAuth,
    allowRoles('SUPERADMIN'),
    validate(loginAsSchema),
    loginAsController
);

router.post(
    '/return-to-admin',
    requireAuth,
    returnToAdminController
);

export default router;
