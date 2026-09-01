import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'FLEET_MANAGER',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let user = null;
    if (userId && userId !== 'demo-admin-id') {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, avatar: true }
      });
    }

    if (!user) {
      // Fallback demo user
      user = {
        id: 'demo-admin-id',
        name: 'Elena Rostova',
        email: 'admin@catfleet360.com',
        role: req.user?.role || 'ADMINISTRATOR',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
};
