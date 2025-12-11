import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Update applicant profile
 */
export const updateApplicantProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'APPLICANT') {
            return res.status(403).json({ error: 'Only applicants can update applicant profile' });
        }

        const { skills, experience, education, bio, location, yearsOfExp, resumeUrl } = req.body;

        const applicantProfile = await prisma.applicantProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!applicantProfile) {
            return res.status(404).json({ error: 'Applicant profile not found' });
        }

        const updatedProfile = await prisma.applicantProfile.update({
            where: { userId: req.user.userId },
            data: {
                ...(skills && { skills: JSON.stringify(skills) }),
                ...(experience && { experience }),
                ...(education && { education }),
                ...(bio !== undefined && { bio }),
                ...(location !== undefined && { location }),
                ...(yearsOfExp !== undefined && { yearsOfExp }),
                ...(resumeUrl !== undefined && { resumeUrl }),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        res.json({
            message: 'Profile updated successfully',
            profile: {
                ...updatedProfile,
                skills: JSON.parse(updatedProfile.skills),
            }
        });
    } catch (error: any) {
        console.error('Update applicant profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

/**
 * Update recruiter profile
 */
export const updateRecruiterProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can update recruiter profile' });
        }

        const { companyName, description } = req.body;

        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        const updatedProfile = await prisma.recruiterProfile.update({
            where: { userId: req.user.userId },
            data: {
                ...(companyName && { companyName }),
                ...(description !== undefined && { description }),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        res.json({
            message: 'Profile updated successfully',
            profile: updatedProfile,
        });
    } catch (error: any) {
        console.error('Update recruiter profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

/**
 * Get user profile (own profile)
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                recruiterProfile: true,
                applicantProfile: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;

        // For applicants, flatten the profile data
        if (user.applicantProfile) {
            const skills = user.applicantProfile.skills ? JSON.parse(user.applicantProfile.skills) : [];
            return res.json({
                user: userWithoutPassword,
                skills: skills,
                experience: user.applicantProfile.experience,
                education: user.applicantProfile.education,
                resumeUrl: user.applicantProfile.resumeUrl,
            });
        }

        res.json({ user: userWithoutPassword });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

/**
 * Get recruiter dashboard stats
 */
export const getRecruiterDashboard = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Only recruiters can access dashboard' });
        }

        const recruiterProfile = await prisma.recruiterProfile.findUnique({
            where: { userId: req.user.userId }
        });

        if (!recruiterProfile) {
            return res.status(404).json({ error: 'Recruiter profile not found' });
        }

        // Get total jobs
        const totalJobs = await prisma.job.count({
            where: { recruiterId: recruiterProfile.id }
        });

        // Get active jobs
        const activeJobs = await prisma.job.count({
            where: {
                recruiterId: recruiterProfile.id,
                isActive: true,
            }
        });

        // Get total applications
        const totalApplications = await prisma.application.count({
            where: {
                job: {
                    recruiterId: recruiterProfile.id,
                }
            }
        });

        // Get applications by status
        const applicationsByStatus = await prisma.application.groupBy({
            by: ['status'],
            where: {
                job: {
                    recruiterId: recruiterProfile.id,
                }
            },
            _count: {
                status: true,
            }
        });

        // Get recent applications
        const recentApplications = await prisma.application.findMany({
            where: {
                job: {
                    recruiterId: recruiterProfile.id,
                }
            },
            include: {
                applicant: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                job: {
                    select: {
                        title: true,
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc',
            },
            take: 10,
        });

        const recentApplicationsWithParsedData = recentApplications.map(app => ({
            ...app,
            applicant: {
                ...app.applicant,
                skills: JSON.parse(app.applicant.skills),
            }
        }));

        res.json({
            stats: {
                totalJobs,
                activeJobs,
                totalApplications,
                applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
                    acc[curr.status] = curr._count.status;
                    return acc;
                }, {} as Record<string, number>),
            },
            recentApplications: recentApplicationsWithParsedData,
        });
    } catch (error: any) {
        console.error('Get recruiter dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
