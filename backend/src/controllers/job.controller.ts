import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Create a new job posting (Recruiter only)
 */
export const createJob = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can create jobs' });
        }

        const {
            title,
            description,
            requiredSkills,
            experienceRequired,
            educationRequired,
            location,
            jobType,
            salary,
            otherRequirements
        } = req.body;

        // Validation
        if (!title || !description || !requiredSkills || !experienceRequired || !educationRequired) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get recruiter profile
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        // Create job
        const job = await prisma.job.create({
            data: {
                recruiterId: recruiterProfile.id,
                title,
                description,
                requiredSkills: JSON.stringify(requiredSkills),
                experienceRequired,
                educationRequired,
                location,
                jobType,
                salary,
                otherRequirements,
            },
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
        });

        res.status(201).json({
            message: 'Job created successfully',
            job: {
                ...job,
                requiredSkills: JSON.parse(job.requiredSkills),
            }
        });
    } catch (error: any) {
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

/**
 * Get all jobs (with optional filters)
 */
export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const { search, location, experienceLevel, educationLevel, jobType } = req.query;

        const where: any = {
            isActive: true,
        };

        // Apply filters
        if (search) {
            where.OR = [
                { title: { contains: search as string } },
                { description: { contains: search as string } },
            ];
        }

        if (location) {
            where.location = { contains: location as string };
        }

        if (experienceLevel) {
            where.experienceRequired = experienceLevel;
        }

        if (educationLevel) {
            where.educationRequired = educationLevel;
        }

        if (jobType) {
            where.jobType = jobType;
        }

        const jobs = await prisma.job.findMany({
            where,
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
                },
                _count: {
                    select: {
                        applications: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Parse requiredSkills JSON
        const jobsWithParsedSkills = jobs.map(job => ({
            ...job,
            requiredSkills: JSON.parse(job.requiredSkills),
        }));

        res.json({ jobs: jobsWithParsedSkills });
    } catch (error: any) {
        console.error('Get all jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

/**
 * Get single job by ID
 */
export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const job = await prisma.job.findUnique({
            where: { id },
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
                },
                _count: {
                    select: {
                        applications: true,
                    }
                }
            }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            job: {
                ...job,
                requiredSkills: JSON.parse(job.requiredSkills),
            }
        });
    } catch (error: any) {
        console.error('Get job by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
};

/**
 * Update job (Recruiter only - own jobs)
 */
export const updateJob = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can update jobs' });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Get recruiter profile
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        // Check if job belongs to this recruiter
        const job = await prisma.job.findUnique({
            where: { id }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.recruiterId !== recruiterProfile.id) {
            return res.status(403).json({ error: 'You can only update your own jobs' });
        }

        // Update job
        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.requiredSkills && {
                    requiredSkills: JSON.stringify(updateData.requiredSkills)
                })
            },
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
        });

        res.json({
            message: 'Job updated successfully',
            job: {
                ...updatedJob,
                requiredSkills: JSON.parse(updatedJob.requiredSkills),
            }
        });
    } catch (error: any) {
        console.error('Update job error:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
};

/**
 * Delete job (Recruiter only - own jobs)
 */
export const deleteJob = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can delete jobs' });
        }

        const { id } = req.params;

        // Get recruiter profile
        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        // Check if job belongs to this recruiter
        const job = await prisma.job.findUnique({
            where: { id }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (job.recruiterId !== recruiterProfile.id) {
            return res.status(403).json({ error: 'You can only delete your own jobs' });
        }

        // Delete job (will cascade delete applications)
        await prisma.job.delete({
            where: { id }
        });

        res.json({ message: 'Job deleted successfully' });
    } catch (error: any) {
        console.error('Delete job error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
};

/**
 * Get recruiter's own jobs
 */
export const getMyJobs = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can access this endpoint' });
        }

        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        const jobs = await prisma.job.findMany({
            where: {
                recruiterId: recruiterProfile.id,
            },
            include: {
                _count: {
                    select: {
                        applications: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        const jobsWithParsedSkills = jobs.map(job => ({
            ...job,
            requiredSkills: JSON.parse(job.requiredSkills),
        }));

        res.json({ jobs: jobsWithParsedSkills });
    } catch (error: any) {
        console.error('Get my jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};
