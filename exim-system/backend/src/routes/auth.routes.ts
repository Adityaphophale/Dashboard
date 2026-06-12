import { Router } from 'express';
import { 
  login, 
  getProfile, 
  updateProfile, 
  updatePassword, 
  getRbacMatrix, 
  getAuditLogs 
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/login', login);

// Authenticated routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, updatePassword);
router.get('/rbac', authenticateToken, getRbacMatrix);
router.get('/audit-logs', authenticateToken, getAuditLogs);

export default router;
