import { Router } from 'express';
import { getInquiries, createInquiry, updateInquiry } from '../controllers/inquiry.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getInquiries);
router.post('/', createInquiry);
router.put('/:id', updateInquiry);

export default router;
