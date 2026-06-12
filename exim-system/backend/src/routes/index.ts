import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import inquiryRoutes from './inquiry.routes';
import leadRoutes from './lead.routes';
import quotationRoutes from './quotation.routes';
import orderRoutes from './order.routes';
import supplierRoutes from './supplier.routes';
import poRoutes from './po.routes';
import shipmentRoutes from './shipment.routes';
import documentRoutes from './document.routes';
import paymentRoutes from './payment.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'EXIM System API v1 is available' });
});

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/leads', leadRoutes);
router.use('/quotations', quotationRoutes);
router.use('/orders', orderRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', poRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/documents', documentRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
