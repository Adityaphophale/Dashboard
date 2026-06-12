import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getShipments = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userEmail = (req as any).user?.email;

    const whereClause: any = {};
    
    if (userRole === 'Customer') {
      const customer = await prisma.customer.findFirst({
        where: { email: userEmail }
      });
      if (customer) {
        whereClause.order = { customerId: customer.id };
      } else {
        return res.status(200).json([]);
      }
    }

    const shipments = await prisma.shipment.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            customer: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const { orderId, containerNumber, blNumber, awbNumber, shippingLine, vesselName, freightForwarder, portOfLoading, portOfDischarge, etd, eta } = req.body;

    const count = await prisma.shipment.count();
    const shipmentNumber = `SH-2026-${String(count + 1).padStart(4, '0')}`;

    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber,
        orderId,
        containerNumber,
        blNumber,
        awbNumber,
        shippingLine,
        vesselName,
        freightForwarder,
        portOfLoading: portOfLoading || 'Mumbai',
        portOfDischarge: portOfDischarge || 'Rotterdam',
        etd: new Date(etd),
        eta: new Date(eta),
        status: 'Booking Confirmed',
        statusHistory: {
          create: {
            status: 'Booking Confirmed',
            notes: 'Initial cargo booking registered.'
          }
        }
      },
      include: {
        order: {
          include: {
            customer: true
          }
        },
        statusHistory: true
      }
    });

    // Notify documentation officer and customer
    await prisma.notification.createMany({
      data: [
        {
          userId: (req as any).user.id,
          title: 'Shipment Booked',
          message: `Shipment ${shipmentNumber} has been booked for Order.`,
          type: 'Info'
        }
      ]
    });

    return res.status(201).json(shipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    const userId = (req as any).user.id;

    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dbShipment = await tx.shipment.update({
        where: { id },
        data: { status },
        include: {
          order: {
            include: {
              customer: true
            }
          }
        }
      });

      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: id,
          status,
          notes: notes || `Shipment status updated to ${status}`,
          updatedBy: userId
        }
      });

      // If status is Delivered, let's update the Order status too!
      if (status === 'Delivered') {
        await tx.order.update({
          where: { id: dbShipment.orderId },
          data: { status: 'Delivered' }
        });
      } else if (status === 'In Transit') {
        await tx.order.update({
          where: { id: dbShipment.orderId },
          data: { status: 'Shipped' }
        });
      }

      return dbShipment;
    });

    const detailedShipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return res.status(200).json(detailedShipment);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateShipmentDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { containerNumber, blNumber, awbNumber, shippingLine, vesselName, freightForwarder, portOfLoading, portOfDischarge, etd, eta } = req.body;

    const updated = await prisma.shipment.update({
      where: { id },
      data: {
        containerNumber,
        blNumber,
        awbNumber,
        shippingLine,
        vesselName,
        freightForwarder,
        portOfLoading,
        portOfDischarge,
        etd: etd ? new Date(etd) : undefined,
        eta: eta ? new Date(eta) : undefined,
      },
      include: {
        order: {
          include: {
            customer: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating shipment details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
