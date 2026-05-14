import { Router } from 'express';
import { listTemplatesController } from '../modules/templates/template.controller';

const router = Router();

router.get('/', listTemplatesController);

export default router;
