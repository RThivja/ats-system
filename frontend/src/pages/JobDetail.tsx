import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';
import apiClient from '../services/api';

interface Job {
    id: string;
    title: string;
    description: string;
    location?: string;
    jobType?: string;
    salary?: string;
    requiredSkills: string[];
    experienceRequired: string;
    educationRequired: string;
    otherRequirements?: string;
    recruiter: {
        companyName: string;
        user: {
            name: string;
            email: string;
        };
    };
    postedAt?: string;
}

export default function JobDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [success, setSuccess] = useState(false);

    // Live Match Analysis
    const [matchScore, setMatchScore] = useState(0);
    const [missingSkills, setMissingSkills] = useState<string[]>([]);

    // Auth Modal Trigger (Localized state or via context if available, here using simple redirect to home with state if needed, or simple alert)


    useEffect(() => {
        fetchJob();
        if (user && user.role === 'APPLICANT') {
            checkIfApplied();
            fetchProfile();
        }
    }, [id, user]);

    useEffect(() => {
        if (job && profile) {
            calculateLiveMatch();
        }
    }, [job, profile]);

    const fetchJob = async () => {
        try {
            const response = await apiClient.get(`/jobs/${id}`);
            setJob(response.data.job);
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/users/profile');
            const p = response.data;
            let skills: string[] = [];
            try {
                skills = Array.isArray(p.skills) ? p.skills : JSON.parse(p.skills || '[]');
            } catch (e) {
                if (typeof p.skills === 'string') skills = p.skills.split(',').map((s: string) => s.trim());
            }

            setProfile({
                ...p,
                skills,
                isComplete: skills.length > 0 && p.experience && p.education && p.resumeUrl
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const calculateLiveMatch = () => {
        if (!job || !profile) return;

        const jobSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
        const userSkills = profile.skills.map((s: string) => s.toLowerCase().trim());

        if (jobSkills.length === 0) {
            setMatchScore(100);
            return;
        }

        let hits = 0;
        const missing: string[] = [];

        jobSkills.forEach(js => {
            const match = userSkills.some((us: string) => us === js || us.includes(js) || js.includes(us));
            if (match) hits++;
            else missing.push(js);
        });

        setMatchScore(Math.round((hits / jobSkills.length) * 100));
        setMissingSkills(missing);
    };

    const checkIfApplied = async () => {
        try {
            const response = await apiClient.get('/applications/my/applications');
            const applied = response.data.applications.some((app: any) => app.jobId === id);
            setAlreadyApplied(applied);
        } catch (error) {
            console.error('Failed to check application:', error);
        }
    };

    const handleApply = async () => {
        if (!user) {
            // If checking details without login, redirect to login
            // Ideally trigger the Home modal, but for now redirecting to home with a param is easiest
            // Or simple alert
            alert("Please Login to Apply");
            navigate('/');
            return;
        }

        setApplying(true);
        try {
            await apiClient.post('/applications/apply', {
                jobId: id,
                coverLetter: `Application for ${job?.title}`,
                resumeData: profile.resumeUrl
            });

            setSuccess(true);
            setTimeout(() => navigate('/my-applications'), 2000);
        } catch (err: any) {
            console.error(err);
            alert('Failed to apply: ' + (err.response?.data?.error || 'Unknown error'));
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Loading position...</p></div>;

    if (!job) return <div className="h-screen flex items-center justify-center"><p>Job not found</p></div>;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Hero Header */}
            <div className="h-64 bg-gradient-to-r from-gray-900 to-blue-900 relative">
                <div className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl shadow-md">A</div>
                    <span className="text-xl font-bold text-white tracking-tight">ATS</span>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 -mt-24 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shadow-inner text-blue-600 font-bold">
                                {job.recruiter.companyName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                                <p className="text-lg text-gray-600 font-medium mb-4">{job.recruiter.companyName}</p>
                                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                                    {job.location && <span className="flex items-center gap-1">📍 {job.location}</span>}
                                    {job.jobType && <span className="flex items-center gap-1">💼 {job.jobType}</span>}
                                    {job.salary && <span className="flex items-center gap-1 text-green-600">💰 {job.salary}</span>}
                                    <span className="flex items-center gap-1">📅 Posted recently</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About the Job</h2>
                        <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </div>

                        <hr className="my-8 border-gray-100" />

                        <h3 className="text-lg font-bold text-gray-900 mb-4">You will need</h3>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {job.requiredSkills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Experience</h4>
                                <p className="font-medium text-gray-900">{job.experienceRequired}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Education</h4>
                                <p className="font-medium text-gray-900">{job.educationRequired}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Apply Action & Match Score) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Match Score Card - Visible Only if Applicant Logged In */}
                    {user && user.role === 'APPLICANT' && (
                        <div className={`p-6 rounded-xl border shadow-sm ${matchScore > 50 ? 'bg-white border-green-200 ring-4 ring-green-50' : 'bg-white border-gray-200'}`}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Your Fit for this Role</h3>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="none" />
                                        <circle cx="32" cy="32" r="28" stroke={matchScore > 50 ? "#10b981" : "#ef4444"} strokeWidth="6" fill="none" strokeDasharray={`${matchScore * 1.75}, 1000`} />
                                    </svg>
                                    <span className="absolute text-sm font-bold text-gray-900">{matchScore}%</span>
                                </div>
                                <div>
                                    <p className={`font-bold ${matchScore > 50 ? 'text-green-700' : 'text-red-600'}`}>
                                        {matchScore > 80 ? 'Excellent Match!' : matchScore > 50 ? 'Good Match' : 'Low Match'}
                                    </p>
                                    <p className="text-xs text-gray-500">Based on skills</p>
                                </div>
                            </div>

                            {missingSkills.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 mb-2">MISSING SKILLS</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {missingSkills.map((s, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs line-through">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="sticky top-6 space-y-6">
                        {!user ? (
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                                <h3 className="font-bold text-gray-900 mb-2">Interested in this job?</h3>
                                <p className="text-gray-500 text-sm mb-4">Sign in to view your match score and apply.</p>
                                <button onClick={() => navigate('/')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition">
                                    Login to Apply
                                </button>
                            </div>
                        ) : user.role === 'RECRUITER' ? (
                            <div className="bg-gray-100 p-6 rounded-xl text-center">
                                <p className="text-gray-500 font-medium">Recruiters cannot apply to jobs.</p>
                            </div>
                        ) : alreadyApplied ? (
                            <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                                <div className="text-4xl mb-2">✅</div>
                                <h3 className="text-lg font-bold text-green-800">Applied</h3>
                                <p className="text-green-600 text-sm mt-1">You submitted your application.</p>
                                <button onClick={() => navigate('/my-applications')} className="mt-4 w-full bg-white border border-green-200 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition">
                                    Track Status
                                </button>
                            </div>
                        ) : success ? (
                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center animate-bounce-short">
                                <h3 className="text-lg font-bold text-blue-800">Successfully Applied! 🚀</h3>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                {profile?.isComplete ? (
                                    <>
                                        <div className="mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Applying as</p>
                                            <div className="font-bold text-gray-900">{profile.user.name}</div>
                                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                ✓ Profile Complete
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {applying ? 'Sending...' : '⚡ Apply Now'}
                                        </button>
                                        <p className="text-xs text-center text-gray-400 mt-3">
                                            Your full profile and resume will be sent.
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="mb-4 bg-orange-50 p-4 rounded-lg border border-orange-100 text-left">
                                            <h4 className="font-bold text-orange-800 text-sm mb-1">Profile Incomplete</h4>
                                            <p className="text-orange-700 text-xs">
                                                Please complete your profile skills and resume before applying.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg shadow transition-colors"
                                        >
                                            Complete Profile →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
