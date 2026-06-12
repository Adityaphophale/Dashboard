import { Router } from 'express';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/document.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDocuments);
router.post('/', uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
