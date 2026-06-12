import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Inquiries
export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      include: {
        customer: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { customerId, productId, quantity, targetPrice, notes, status } = req.body;
    
    const count = await prisma.inquiry.count();
    const inquiryNumber = `INQ-2026-${String(count + 1).padStart(3, '0')}`;

    const newInquiry = await prisma.inquiry.create({
      data: {
        inquiryNumber,
        customerId,
        productId,
        quantity: parseInt(quantity),
        targetPrice: parseFloat(targetPrice),
        notes,
        status: status || 'Received',
      },
      include: {
        customer: true,
        product: true,
      }
    });

    return res.status(201).json(newInquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInquiry = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes, quantity, targetPrice } = req.body;

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status,
        notes,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        targetPrice: targetPrice !== undefined ? parseFloat(targetPrice) : undefined,
      },
      include: {
        customer: true,
        product: true,
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Leads
export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const { customerId, source, assignedTo, status, notes } = req.body;

    const count = await prisma.lead.count();
    const leadNumber = `LEAD-2026-${String(count + 1).padStart(3, '0')}`;

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        customerId,
        source,
        assignedTo,
        status: status || 'New',
        notes,
      },
      include: {
        customer: true,
        user: true,
      }
    });

    return res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes, assignedTo } = req.body;

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status,
        notes,
        assignedTo,
      },
      include: {
        customer: true,
        user: true,
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
