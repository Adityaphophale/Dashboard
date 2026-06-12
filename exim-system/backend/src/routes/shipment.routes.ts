import { Router } from 'express';
import { getShipments, createShipment, updateShipmentStatus, updateShipmentDetails } from '../controllers/shipment.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getShipments);
router.post('/', createShipment);
router.put('/:id/status', updateShipmentStatus);
router.put('/:id/details', updateShipmentDetails);

export default router;
