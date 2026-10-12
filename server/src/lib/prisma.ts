import { PrismaClient } from '@prisma/client';
import { DSAMetricsTracker } from '../algorithms/metricsTracker';

export const prisma = new PrismaClient();

// Initialize DSA tracker with prisma client
DSAMetricsTracker.init(prisma);
