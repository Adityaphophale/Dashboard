import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, country, email, phone } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson,
        country,
        email,
        phone,
      },
    });

    return res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, contactPerson, country, email, phone } = req.body;

    const updated = await prisma.supplier.update({
      where: { id },
      data: { name, contactPerson, country, email, phone },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.supplier.delete({
      where: { id },
    });
    return res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
