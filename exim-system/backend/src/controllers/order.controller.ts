import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userEmail = (req as any).user?.email;

    const whereClause: any = {};
    
    // Role-based filtering
    if (userRole === 'Customer') {
      const customer = await prisma.customer.findFirst({
        where: { email: userEmail }
      });
      if (customer) {
        whereClause.customerId = customer.id;
      } else {
        return res.status(200).json([]);
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        shipments: true,
        purchaseOrders: {
          include: {
            supplier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, currency, totalAmount, advanceAmount, paymentTerms, incoterms, expectedDispatchDate, items } = req.body;

    const count = await prisma.order.count();
    const orderNumber = `ORD-2026-${String(count + 1).padStart(4, '0')}`;

    const itemsData: any[] = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) {
        return res.status(400).json({ error: `Product not found with id: ${item.productId}` });
      }
      const unitPrice = parseFloat(item.unitPrice || product.price);
      const quantity = parseInt(item.quantity);
      const totalPrice = unitPrice * quantity;
      calculatedTotal += totalPrice;

      itemsData.push({
        productId: item.productId,
        quantity,
        unitPrice,
        totalPrice
      });
    }

    const finalTotal = totalAmount ? parseFloat(totalAmount) : calculatedTotal;
    const adv = parseFloat(advanceAmount || 0);
    const bal = finalTotal - adv;

    const order = await prisma.$transaction(async (tx) => {
      const dbOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          currency: currency || 'USD',
          totalAmount: finalTotal,
          advanceAmount: adv,
          balanceAmount: bal,
          paymentTerms: paymentTerms || '20% Advance, 80% on BL',
          incoterms: incoterms || 'FOB',
          status: 'Confirmed',
          expectedDispatchDate: new Date(expectedDispatchDate),
          items: {
            createMany: {
              data: itemsData
            }
          }
        }
      });

      // Create initial payment invoice
      const invoiceCount = await tx.payment.count();
      const invoiceNumber = `INV-2026-${String(invoiceCount + 1).padStart(4, '0')}`;

      await tx.payment.create({
        data: {
          invoiceNumber,
          orderId: dbOrder.id,
          invoiceAmount: finalTotal,
          receivedAmount: adv,
          pendingAmount: bal,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          status: adv > 0 ? 'Partially Paid' : 'Pending'
        }
      });

      return dbOrder;
    });

    const detailedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(201).json(detailedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
