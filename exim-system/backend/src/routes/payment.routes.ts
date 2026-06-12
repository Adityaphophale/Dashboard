import { Router } from 'express';
import { getPayments, updatePaymentStatus } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getPayments);
router.put('/:id/status', updatePaymentStatus);

export default router;
