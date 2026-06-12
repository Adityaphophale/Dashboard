import { Router } from 'express';
import { getLeads, createLead, updateLead } from '../controllers/inquiry.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);

export default router;
