import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getQuotations = async (req: Request, res: Response) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const { customerId, currency, validUntil, items, taxRate } = req.body;

    const count = await prisma.quotation.count();
    const quotationNumber = `QT-2026-${String(count + 1).padStart(3, '0')}`;

    let subTotal = 0;
    const itemsData = [];

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
      subTotal += totalPrice;

      itemsData.push({
        productId: item.productId,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    const calculatedTaxRate = parseFloat(taxRate || 0);
    const taxTotal = subTotal * (calculatedTaxRate / 100);
    const grandTotal = subTotal + taxTotal;

    const newQuotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        currency: currency || 'USD',
        subTotal,
        taxTotal,
        grandTotal,
        validUntil: new Date(validUntil),
        status: 'Draft',
        items: {
          createMany: {
            data: itemsData
          }
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateQuotationStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.quotation.update({
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
    console.error('Error updating quotation status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const convertToOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { paymentTerms, incoterms, expectedDispatchDate } = req.body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (quotation.status !== 'Approved') {
      // Auto approve on conversion if not already approved
      await prisma.quotation.update({
        where: { id },
        data: { status: 'Approved' }
      });
    }

    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-2026-${String(orderCount + 1).padStart(4, '0')}`;

    // Create order, order items and initial pending payment
    const order = await prisma.$transaction(async (tx) => {
      const dbOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: quotation.customerId,
          quotationId: quotation.id,
          currency: quotation.currency,
          totalAmount: quotation.grandTotal,
          advanceAmount: 0.00,
          balanceAmount: quotation.grandTotal,
          paymentTerms: paymentTerms || '100% CAD',
          incoterms: incoterms || 'FOB',
          status: 'Confirmed',
          expectedDispatchDate: expectedDispatchDate ? new Date(expectedDispatchDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 days
          items: {
            createMany: {
              data: (quotation.items as any[]).map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
              }))
            }
          }
        }
      });

      // Create invoice/payment record
      const invoiceCount = await tx.payment.count();
      const invoiceNumber = `INV-2026-${String(invoiceCount + 1).padStart(4, '0')}`;
      
      await tx.payment.create({
        data: {
          invoiceNumber,
          orderId: dbOrder.id,
          invoiceAmount: quotation.grandTotal,
          receivedAmount: 0.00,
          pendingAmount: quotation.grandTotal,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          status: 'Pending'
        }
      });

      return dbOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error converting quotation to order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
