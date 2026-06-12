import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, status, country } = req.query;
    
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { companyName: { contains: String(search) } },
        { customerCode: { contains: String(search) } },
        { contactPerson: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }
    
    if (status && status !== 'all') {
      whereClause.status = String(status);
    }
    
    if (country && country !== 'all') {
      whereClause.country = String(country);
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate outstanding balance based on unpaid invoices
    const customersWithBalances = await Promise.all(
      customers.map(async (cust) => {
        const payments = await prisma.payment.findMany({
          where: {
            order: { customerId: cust.id },
            status: { in: ['Pending', 'Partially Paid'] },
          },
        });
        const outstanding = payments.reduce((sum, p) => sum + Number(p.pendingAmount), 0);
        return {
          ...cust,
          outstandingBalance: outstanding,
        };
      })
    );

    return res.status(200).json(customersWithBalances);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { companyName, contactPerson, email, phone, country, address, gstVatNumber, status } = req.body;
    
    const count = await prisma.customer.count();
    const customerCode = `CUST-2026-${String(count + 1).padStart(3, '0')}`;

    const newCustomer = await prisma.customer.create({
      data: {
        customerCode,
        companyName,
        contactPerson,
        email,
        phone,
        country,
        address,
        gstVatNumber,
        status: status || 'active',
      },
    });

    return res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { companyName, contactPerson, email, phone, country, address, gstVatNumber, status } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        country,
        address,
        gstVatNumber,
        status,
      },
    });

    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    await prisma.customer.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
