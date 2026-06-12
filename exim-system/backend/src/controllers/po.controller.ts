import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        order: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(pos);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { supplierId, orderId, totalAmount, expectedDeliveryDate } = req.body;

    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-2026-${String(count + 1).padStart(4, '0')}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        orderId,
        totalAmount: parseFloat(totalAmount),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        status: 'Created',
      },
      include: {
        supplier: true,
        order: true
      }
    });

    return res.status(201).json(po);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePOStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        order: true
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
