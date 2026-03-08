import { Router } from 'express';
import { searchEntities } from '../controllers/EntityController';

const router = Router();

router.get('/search', searchEntities);

export default router;
