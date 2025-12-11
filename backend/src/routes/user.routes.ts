import { Router } from 'express';
import {
    updateApplicantProfile,
    updateRecruiterProfile,
    getProfile,
    getRecruiterDashboard
} from '../controllers/user.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/applicant/profile', authenticate, authorizeRole('APPLICANT'), updateApplicantProfile);
router.put('/recruiter/profile', authenticate, authorizeRole('RECRUITER'), updateRecruiterProfile);
router.get('/recruiter/dashboard', authenticate, authorizeRole('RECRUITER'), getRecruiterDashboard);

export default router;
