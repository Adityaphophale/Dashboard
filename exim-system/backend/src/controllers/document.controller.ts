import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userEmail = (req as any).user?.email;

    const whereClause: any = {};
    
    if (userRole === 'Customer') {
      const customer = await prisma.customer.findFirst({
        where: { email: userEmail }
      });
      if (customer) {
        const orders = await prisma.order.findMany({
          where: { customerId: customer.id },
          select: { id: true }
        });
        const orderIds = orders.map(o => o.id);
        whereClause.entityType = 'Order';
        whereClause.entityId = { in: orderIds };
      } else {
        return res.status(200).json([]);
      }
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });
    
    // Attach details about what order this document belongs to
    const docsWithDetails = await Promise.all(
      documents.map(async (doc) => {
        let referenceNumber = 'N/A';
        if (doc.entityType === 'Order') {
          const order = await prisma.order.findUnique({
            where: { id: doc.entityId },
            select: { orderNumber: true }
          });
          if (order) referenceNumber = order.orderNumber;
        }
        return {
          ...doc,
          referenceNumber
        };
      })
    );

    return res.status(200).json(docsWithDetails);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, documentType, fileName, fileSize, contentType } = req.body;
    const userId = (req as any).user.id;

    if (!entityType || !entityId || !documentType || !fileName) {
      return res.status(400).json({ error: 'Required fields: entityType, entityId, documentType, fileName' });
    }

    const fileUrl = `/uploads/${fileName}`;

    const newDoc = await prisma.document.create({
      data: {
        entityType,
        entityId,
        documentType,
        fileName,
        fileSize: fileSize ? parseInt(fileSize) : 102400,
        contentType: contentType || 'application/pdf',
        s3Key: `uploads/${fileName}`,
        fileUrl,
        uploadedBy: userId,
      }
    });

    return res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.document.delete({
      where: { id }
    });
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
