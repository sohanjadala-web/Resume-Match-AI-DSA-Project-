import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateToken } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN']).optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password, fullName, role, phone, companyName } = parsed.data;

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let companyId: string | undefined;
    if (role === 'RECRUITER' && companyName) {
      let company = await prisma.company.findUnique({ where: { name: companyName } });
      if (!company) {
        company = await prisma.company.create({
          data: { name: companyName },
        });
      }
      companyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        fullName,
        phone,
        ...(role === 'CANDIDATE'
          ? {
              candidateProfile: {
                create: {
                  profileCompletedPercent: 25,
                },
              },
            }
          : {
              recruiterProfile: {
                create: {
                  companyId,
                  title: 'Recruiter',
                },
              },
            }),
      },
      include: {
        candidateProfile: true,
        recruiterProfile: true,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      fullName: user.fullName,
      candidateProfileId: user.candidateProfile?.id,
      recruiterProfileId: user.recruiterProfile?.id,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        candidateProfileId: user.candidateProfile?.id,
        recruiterProfileId: user.recruiterProfile?.id,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password, role } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidateProfile: true,
        recruiterProfile: {
          include: { company: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    // Role check if specified by user login portal
    if (role && user.role !== role) {
      res.status(403).json({
        error: `Account role mismatch: This account is registered as ${user.role}, not ${role}. Please use the ${user.role.toLowerCase()} portal.`,
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      fullName: user.fullName,
      candidateProfileId: user.candidateProfile?.id,
      recruiterProfileId: user.recruiterProfile?.id,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        candidateProfileId: user.candidateProfile?.id,
        recruiterProfileId: user.recruiterProfile?.id,
        company: user.recruiterProfile?.company,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: {
          include: {
            skills: { include: { skill: true } },
          },
        },
        recruiterProfile: {
          include: { company: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        candidateProfile: user.candidateProfile,
        recruiterProfile: user.recruiterProfile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch current user session.' });
  }
};
