import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { productCode: 'asc' },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, hsCode, unit, price, currency } = req.body;
    
    const count = await prisma.product.count();
    const productCode = `PROD-${String(count + 1).padStart(3, '0')}`;

    const newProduct = await prisma.product.create({
      data: {
        productCode,
        name,
        hsCode,
        unit,
        price,
        currency: currency || 'USD',
      },
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
