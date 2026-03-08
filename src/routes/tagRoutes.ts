import { Router } from 'express';
import { attachTags, getAnalytics } from '../controllers/TagController';

const router = Router();

router.post('/attach', attachTags);
router.get('/analytics', getAnalytics);

export default router;
