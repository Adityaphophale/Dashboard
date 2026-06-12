import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role?.name || 'User'
    });

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name || 'User'
    };

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error?.code === 'ECONNREFUSED' || error?.code === 'P1001' || error?.code === 'P1002') {
      return res.status(503).json({
        error: 'Database connection failed. Please start PostgreSQL and verify DATABASE_URL in backend/.env',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_PROFILE',
        details: `Updated profile name to ${firstName} ${lastName}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ 
      status: 'success', 
      message: 'Profile updated successfully', 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role?.name || 'User'
      }
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHANGE_PASSWORD',
        details: 'User changed account password',
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    console.error('updatePassword error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRbacMatrix = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return res.status(200).json({ status: 'success', data: roles });
  } catch (error) {
    console.error('getRbacMatrix error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
