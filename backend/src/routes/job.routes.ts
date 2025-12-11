import { Router } from 'express';
import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs
} from '../controllers/job.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - Recruiter only
router.post('/', authenticate, authorizeRole('RECRUITER'), createJob);
router.put('/:id', authenticate, authorizeRole('RECRUITER'), updateJob);
router.delete('/:id', authenticate, authorizeRole('RECRUITER'), deleteJob);
router.get('/my/jobs', authenticate, authorizeRole('RECRUITER'), getMyJobs);

export default router;
