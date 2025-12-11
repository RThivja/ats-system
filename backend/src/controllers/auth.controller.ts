import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';

/**
 * Register a new user (Recruiter or Applicant)
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role, name, phone, companyName, skills, experience, education, location, yearsOfExp } = req.body;

        // Validation
        if (!email || !password || !role || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['RECRUITER', 'APPLICANT'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with profile
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                name,
                phone,
                ...(role === 'RECRUITER' && {
                    recruiterProfile: {
                        create: {
                            companyName: companyName || 'My Company',
                        }
                    }
                }),
                ...(role === 'APPLICANT' && {
                    applicantProfile: {
                        create: {
                            skills: JSON.stringify(skills || []),
                            experience: experience || 'ENTRY',
                            education: education || 'BACHELOR',
                            location: location || '',
                            yearsOfExp: yearsOfExp || 0,
                        }
                    }
                })
            },
            include: {
                recruiterProfile: true,
                applicantProfile: true,
            }
        });

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userWithoutPassword,
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                recruiterProfile: true,
                applicantProfile: true,
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword,
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

/**
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response) => {
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

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
    } catch (error: any) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
};
