// Simplified types - just what we need to get started
export type UserRole = 'RECRUITER' | 'APPLICANT';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    phone?: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    experienceRequired: string;
    educationRequired: string;
    location?: string;
    jobType?: string;
    salary?: string;
}

export interface Application {
    id: string;
    jobId: string;
    status: string;
    matchScore?: number;
    appliedAt: string;
}
