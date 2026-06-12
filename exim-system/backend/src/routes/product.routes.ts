import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/product.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.post('/', createProduct);

export default router;
