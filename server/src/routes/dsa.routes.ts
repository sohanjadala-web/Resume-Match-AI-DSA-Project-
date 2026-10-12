import { Router } from 'express';
import { runPlayground } from '../controllers/dsa.controller';

const router = Router();

router.post('/playground/run', runPlayground);

export default router;
