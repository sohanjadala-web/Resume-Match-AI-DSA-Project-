import { Router } from 'express';
import multer from 'multer';
import {
  getProfile,
  updateProfile,
  updateSkills,
  parseResume,
  getRecommendations,
  getApplications,
  applyForJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getAnalytics,
} from '../controllers/candidate.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Protect all candidate endpoints
router.use(authenticate, requireRole('CANDIDATE'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/skills', updateSkills);
router.post('/resume', upload.single('resume'), parseResume);
router.get('/recommendations', getRecommendations);
router.get('/applications', getApplications);
router.post('/jobs/:jobId/apply', applyForJob);
router.post('/jobs/:jobId/save', saveJob);
router.delete('/jobs/:jobId/save', unsaveJob);
router.get('/saved-jobs', getSavedJobs);
router.get('/analytics', getAnalytics);

export default router;
