import { Router } from 'express';
import {
    applyToJob,
    getJobApplications,
    getMyApplications,
    updateApplicationStatus,
    getApplicationById
} from '../controllers/application.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - Applicant
router.post('/apply', authenticate, authorizeRole('APPLICANT'), applyToJob);
router.get('/my/applications', authenticate, authorizeRole('APPLICANT'), getMyApplications);

// Protected routes - Recruiter
router.get('/job/:jobId', authenticate, authorizeRole('RECRUITER'), getJobApplications);
router.patch('/:id/status', authenticate, authorizeRole('RECRUITER'), updateApplicationStatus);

// Protected routes - Both
router.get('/:id', authenticate, getApplicationById);

export default router;
