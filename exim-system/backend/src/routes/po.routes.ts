import { Router } from 'express';
import { getPurchaseOrders, createPurchaseOrder, updatePOStatus } from '../controllers/po.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id/status', updatePOStatus);

export default router;
