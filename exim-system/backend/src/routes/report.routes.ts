import { Router } from 'express';
import { getKPIs } from '../controllers/report.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/kpis', getKPIs);

export default router;
