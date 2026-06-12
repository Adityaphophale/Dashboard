import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
    });
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { receivedAmount } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const newReceived = parseFloat(receivedAmount);
    const newPending = Number(payment.invoiceAmount) - newReceived;
    let status = 'Pending';
    if (newReceived >= Number(payment.invoiceAmount)) {
      status = 'Paid';
    } else if (newReceived > 0) {
      status = 'Partially Paid';
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dbPayment = await tx.payment.update({
        where: { id },
        data: {
          receivedAmount: newReceived,
          pendingAmount: newPending,
          status
        },
        include: {
          order: {
            include: {
              customer: true
            }
          }
        }
      });

      // Update the order amounts too!
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          advanceAmount: newReceived,
          balanceAmount: newPending,
        }
      });

      return dbPayment;
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
