/**
 * Calculate matching score between job requirements and applicant profile
 * Returns a score from 0-100
 */

interface JobRequirements {
    requiredSkills: string[]; // Array of required skills
    experienceRequired: string;
    educationRequired: string;
    location?: string;
}

interface ApplicantData {
    skills: string[]; // Array of applicant skills
    experience: string;
    education: string;
    location?: string;
    yearsOfExp: number;
}

export const calculateMatchScore = (
    job: JobRequirements,
    applicant: ApplicantData
): number => {
    let score = 0;

    // 1. Skills Match (40% weight)
    const skillsScore = calculateSkillsMatch(job.requiredSkills, applicant.skills);
    score += skillsScore * 0.4;

    // 2. Experience Level Match (30% weight)
    const experienceScore = calculateExperienceMatch(
        job.experienceRequired,
        applicant.experience,
        applicant.yearsOfExp
    );
    score += experienceScore * 0.3;

    // 3. Education Match (20% weight)
    const educationScore = calculateEducationMatch(
        job.educationRequired,
        applicant.education
    );
    score += educationScore * 0.2;

    // 4. Location Match (10% weight)
    const locationScore = calculateLocationMatch(job.location, applicant.location);
    score += locationScore * 0.1;

    return Math.round(score);
};

/**
 * Calculate skills overlap percentage
 */
const calculateSkillsMatch = (required: string[], applicantSkills: string[]): number => {
    if (required.length === 0) return 100;

    const requiredLower = required.map(s => s.toLowerCase().trim());
    const applicantLower = applicantSkills.map(s => s.toLowerCase().trim());

    let matchCount = 0;
    for (const skill of requiredLower) {
        if (applicantLower.some(as => as.includes(skill) || skill.includes(as))) {
            matchCount++;
        }
    }

    return (matchCount / requiredLower.length) * 100;
};

/**
 * Calculate experience level match
 * Entry < Junior < Mid < Senior < Lead
 */
const calculateExperienceMatch = (
    required: string,
    applicantLevel: string,
    yearsOfExp: number
): number => {
    const levels = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
    const requiredIndex = levels.indexOf(required.toUpperCase());
    const applicantIndex = levels.indexOf(applicantLevel.toUpperCase());

    if (requiredIndex === -1 || applicantIndex === -1) return 50;

    // Exact match
    if (requiredIndex === applicantIndex) return 100;

    // One level difference
    if (Math.abs(requiredIndex - applicantIndex) === 1) return 80;

    // Applicant is more experienced than required (still good)
    if (applicantIndex > requiredIndex) return 90;

    // Two levels difference
    if (Math.abs(requiredIndex - applicantIndex) === 2) return 50;

    // More than two levels difference
    return 30;
};

/**
 * Calculate education level match
 * HIGH_SCHOOL < ASSOCIATE < BACHELOR < MASTER < PHD
 */
const calculateEducationMatch = (required: string, applicantEdu: string): number => {
    const levels = ['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD'];
    const requiredIndex = levels.indexOf(required.toUpperCase());
    const applicantIndex = levels.indexOf(applicantEdu.toUpperCase());

    if (requiredIndex === -1 || applicantIndex === -1) return 50;

    // Exact match or higher education
    if (applicantIndex >= requiredIndex) return 100;

    // One level below
    if (requiredIndex - applicantIndex === 1) return 70;

    // Two or more levels below
    return 40;
};

/**
 * Calculate location match
 */
const calculateLocationMatch = (
    jobLocation?: string,
    applicantLocation?: string
): number => {
    // If job doesn't specify location or is remote, full match
    if (!jobLocation || jobLocation.toLowerCase().includes('remote')) return 100;

    // If applicant doesn't specify location
    if (!applicantLocation) return 50;

    // Simple string match (can be improved with geo-location)
    const jobLoc = jobLocation.toLowerCase().trim();
    const appLoc = applicantLocation.toLowerCase().trim();

    if (jobLoc === appLoc) return 100;
    if (jobLoc.includes(appLoc) || appLoc.includes(jobLoc)) return 80;

    return 30;
};
