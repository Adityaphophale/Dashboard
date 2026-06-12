import { Router } from 'express';
import { getQuotations, createQuotation, updateQuotationStatus, convertToOrder } from '../controllers/quotation.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getQuotations);
router.post('/', createQuotation);
router.put('/:id/status', updateQuotationStatus);
router.post('/:id/convert-to-order', convertToOrder);

export default router;
