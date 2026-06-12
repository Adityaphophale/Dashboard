import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/order.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
