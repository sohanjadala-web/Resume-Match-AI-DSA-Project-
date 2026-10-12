import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getJobs,
  createJob,
  updateJob,
  getJobDetails,
  searchCandidates,
  getRankedCandidatesForJob,
  updateApplicationStatus,
  addNote,
  scheduleInterview,
  optimizeAssignments,
  recommendTeam,
} from '../controllers/recruiter.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Protect all recruiter endpoints
router.use(authenticate, requireRole('RECRUITER'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.get('/jobs/:jobId', getJobDetails);
router.put('/jobs/:jobId', updateJob);
router.get('/candidates/search', searchCandidates);
router.get('/jobs/:jobId/candidates', getRankedCandidatesForJob);
router.patch('/applications/:applicationId/status', updateApplicationStatus);
router.post('/applications/:applicationId/notes', addNote);
router.post('/applications/:applicationId/interview', scheduleInterview);
router.post('/assignments/optimize', optimizeAssignments);
router.post('/teams/recommend', recommendTeam);

export default router;
