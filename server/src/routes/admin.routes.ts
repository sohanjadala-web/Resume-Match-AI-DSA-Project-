import { Router } from 'express';
import {
  getAnalytics,
  getUsers,
  updateUserStatus,
  getJobs,
  updateJobStatus,
  getAuditLogs,
  getAlgorithmMetrics,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints
router.use(authenticate, requireRole('ADMIN'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/jobs', getJobs);
router.patch('/jobs/:jobId/status', updateJobStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/algorithm-metrics', getAlgorithmMetrics);

export default router;
