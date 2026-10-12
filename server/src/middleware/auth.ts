import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'resumematch_super_secure_jwt_secret_token_2026_xyz';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  fullName: string;
  candidateProfileId?: string;
  recruiterProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check Authorization header fallback
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. No session or token found.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        candidateProfile: { select: { id: true } },
        recruiterProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User account is inactive or no longer exists.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'CANDIDATE' | 'RECRUITER' | 'ADMIN',
      fullName: user.fullName,
      candidateProfileId: user.candidateProfile?.id,
      recruiterProfileId: user.recruiterProfile?.id,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (...roles: ('CANDIDATE' | 'RECRUITER' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Forbidden. Role '${req.user.role}' is not authorized for this resource.` });
      return;
    }

    next();
  };
};

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
