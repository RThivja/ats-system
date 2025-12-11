import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { calculateMatchScore } from '../utils/matchingAlgorithm';

/**
 * Apply to a job (Applicant only)
 */
export const applyToJob = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'APPLICANT') {
            return res.status(403).json({ error: 'Only applicants can apply to jobs' });
        }

        const { jobId, coverLetter, resumeData } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        // Get applicant profile
        const applicantProfile = await prisma.applicantProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!applicantProfile) {
            return res.status(404).json({ error: 'Applicant profile not found' });
        }

        // Update resume URL if provided
        if (resumeData && resumeData.trim()) {
            await prisma.applicantProfile.update({
                where: { id: applicantProfile.id },
                data: { resumeUrl: resumeData }
            });
        }

        // Get job details
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (!job.isActive) {
            return res.status(400).json({ error: 'This job is no longer active' });
        }

        // Check if already applied
        const existingApplication = await prisma.application.findUnique({
            where: {
                jobId_applicantId: {
                    jobId,
                    applicantId: applicantProfile.id,
                }
            }
        });

        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied to this job' });
        }

        // Calculate match score
        const matchScore = calculateMatchScore(
            {
                requiredSkills: JSON.parse(job.requiredSkills),
                experienceRequired: job.experienceRequired,
                educationRequired: job.educationRequired,
                location: job.location || undefined,
            },
            {
                skills: JSON.parse(applicantProfile.skills),
                experience: applicantProfile.experience,
                education: applicantProfile.education,
                location: applicantProfile.location || undefined,
                yearsOfExp: applicantProfile.yearsOfExp,
            }
        );

        // Create application
        const application = await prisma.application.create({
            data: {
                jobId,
                applicantId: applicantProfile.id,
                coverLetter,
                matchScore,
            },
            include: {
                job: {
                    include: {
                        recruiter: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                },
                applicant: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application: {
                ...application,
                job: {
                    ...application.job,
                    requiredSkills: JSON.parse(application.job.requiredSkills),
                },
                applicant: {
                    ...application.applicant,
                    skills: JSON.parse(application.applicant.skills),
                }
            },
            matchScore,
        });
    } catch (error: any) {
        console.error('Apply to job error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};

/**
 * Get applications for a job (Recruiter only - own jobs)
 */
export const getJobApplications = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can view applications' });
        }

        const { jobId } = req.params;
        const { status, minMatchScore, sortBy = 'matchScore', order = 'desc' } = req.query;

        // Get recruiter profile
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        // Verify job belongs to recruiter
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.recruiterId !== recruiterProfile.id) {
            return res.status(403).json({ error: 'You can only view applications for your own jobs' });
        }

        // Build where clause
        const where: any = {
            jobId,
        };

        if (status) {
            where.status = status;
        }

        if (minMatchScore) {
            where.matchScore = {
                gte: parseFloat(minMatchScore as string),
            };
        }

        // Build orderBy clause
        const orderBy: any = {};
        if (sortBy === 'matchScore') {
            orderBy.matchScore = order;
        } else if (sortBy === 'date') {
            orderBy.appliedAt = order;
        } else {
            orderBy.matchScore = 'desc'; // Default
        }

        const applications = await prisma.application.findMany({
            where,
            include: {
                applicant: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                }
            },
            orderBy,
        });

        // Parse skills JSON and add resumeUrl
        const applicationsWithParsedData = applications.map(app => ({
            ...app,
            applicant: {
                ...app.applicant,
                skills: JSON.parse(app.applicant.skills),
                resumeUrl: app.applicant.resumeUrl, // Include CV URL
            }
        }));

        res.json({ applications: applicationsWithParsedData });
    } catch (error: any) {
        console.error('Get job applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};

/**
 * Get applicant's own applications
 */
export const getMyApplications = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'APPLICANT') {
            return res.status(403).json({ error: 'Only applicants can access this endpoint' });
        }

        const applicantProfile = await prisma.applicantProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!applicantProfile) {
            return res.status(404).json({ error: 'Applicant profile not found' });
        }

        const applications = await prisma.application.findMany({
            where: {
                applicantId: applicantProfile.id,
            },
            include: {
                job: {
                    include: {
                        recruiter: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc',
            }
        });

        const applicationsWithParsedData = applications.map(app => ({
            ...app,
            job: {
                ...app.job,
                requiredSkills: JSON.parse(app.job.requiredSkills),
            }
        }));

        res.json({ applications: applicationsWithParsedData });
    } catch (error: any) {
        console.error('Get my applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};

/**
 * Update application status (Recruiter only)
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can update application status' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get recruiter profile
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        // Get application with job
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                job: true,
            }
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Verify job belongs to recruiter
        if (application.job.recruiterId !== recruiterProfile.id) {
            return res.status(403).json({ error: 'You can only update applications for your own jobs' });
        }

        // Update status
        const updatedApplication = await prisma.application.update({
            where: { id },
            data: { status },
            include: {
                applicant: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                },
                job: true,
            }
        });

        res.json({
            message: 'Application status updated successfully',
            application: {
                ...updatedApplication,
                applicant: {
                    ...updatedApplication.applicant,
                    skills: JSON.parse(updatedApplication.applicant.skills),
                },
                job: {
                    ...updatedApplication.job,
                    requiredSkills: JSON.parse(updatedApplication.job.requiredSkills),
                }
            }
        });
    } catch (error: any) {
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
};

/**
 * Get single application details
 */
export const getApplicationById = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                applicant: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                },
                job: {
                    include: {
                        recruiter: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Authorization check
        if (req.user.role === 'RECRUITER') {
            const recruiterProfile = await prisma.recruiterProfile.findUnique({
                where: { userId: req.user.userId }
            });

            if (!recruiterProfile || application.job.recruiterId !== recruiterProfile.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        } else if (req.user.role === 'APPLICANT') {
            const applicantProfile = await prisma.applicantProfile.findUnique({
                where: { userId: req.user.userId }
            });

            if (!applicantProfile || application.applicantId !== applicantProfile.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        res.json({
            application: {
                ...application,
                applicant: {
                    ...application.applicant,
                    skills: JSON.parse(application.applicant.skills),
                },
                job: {
                    ...application.job,
                    requiredSkills: JSON.parse(application.job.requiredSkills),
                }
            }
        });
    } catch (error: any) {
        console.error('Get application by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
};
