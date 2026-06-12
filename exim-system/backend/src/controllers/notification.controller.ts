import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.notification.update({
      where: { id },
      data: { readStatus: true }
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
