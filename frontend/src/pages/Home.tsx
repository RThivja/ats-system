import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    createdAt: string;
    recruiter: {
        companyName: string;
    };
}

export default function Home() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // Auth form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'APPLICANT' | 'RECRUITER'>('APPLICANT');
    const [companyName, setCompanyName] = useState('');
    const [skills, setSkills] = useState('');
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { user, login, register, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect recruiter to dashboard
        if (user && user.role === 'RECRUITER') {
            navigate('/dashboard');
            return;
        }
        fetchJobs();
    }, [user]);

    const fetchJobs = async () => {
        try {
            const response = await apiClient.get('/jobs');
            setJobs(response.data.jobs || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (jobId: string) => {
        if (user) {
            navigate(`/job/${jobId}`);
        } else {
            setSelectedJobId(jobId);
            setAuthMode('login');
            setShowAuthModal(true);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAuthLoading(true);

        try {
            if (authMode === 'login') {
                await login(email, password);
                setShowAuthModal(false);
                if (selectedJobId) {
                    navigate(`/job/${selectedJobId}`);
                } else {
                    window.location.reload();
                }
            } else {
                // Register
                // Register calls authService which uses apiClient
                await register({
                    name,
                    email,
                    password,
                    phone,
                    role,
                    companyName: role === 'RECRUITER' ? companyName : undefined,
                    skills: role === 'APPLICANT' ? skills.split(',').map(s => s.trim()) : undefined,
                    experience: 'ENTRY',
                    education: 'BACHELOR',
                });
                setShowAuthModal(false);
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || `${authMode === 'login' ? 'Login' : 'Registration'} failed`);
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <div className="page-bg">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
                                <img src="/logo.png" alt="ATS Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">ATS</span>
                        </div>

                        <nav className="flex items-center gap-4">
                            {user ? (
                                <>
                                    {user.role === 'RECRUITER' ? (
                                        <>
                                            <button onClick={() => navigate('/dashboard')} className="text-gray-700 hover:text-blue-600 font-medium">
                                                Dashboard
                                            </button>
                                            <button onClick={() => navigate('/my-jobs')} className="text-gray-700 hover:text-blue-600 font-medium">
                                                My Jobs
                                            </button>
                                            <button onClick={() => navigate('/create-job')} className="btn-primary text-sm">
                                                ➕ Post Job
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate('/')} className="text-gray-700 hover:text-blue-600 font-medium">
                                                Browse Jobs
                                            </button>
                                            <button onClick={() => navigate('/my-applications')} className="text-gray-700 hover:text-blue-600 font-medium">
                                                My Applications
                                            </button>
                                            <button onClick={() => navigate('/profile')} className="text-gray-700 hover:text-blue-600 font-medium">
                                                Profile
                                            </button>
                                        </>
                                    )}
                                    <div className="border-l pl-4 flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                        </div>
                                        <button onClick={() => { logout(); navigate('/'); }} className="text-red-600 hover:text-red-700 font-medium">
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                                        <span>💼</span>
                                        <span className="text-sm">For Recruiters:</span>
                                        <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-blue-600 font-semibold">
                                            Post a Job
                                        </button>
                                    </div>
                                    <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="px-6 py-2 text-gray-700 hover:text-blue-600 font-semibold">
                                        Sign In
                                    </button>
                                    <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="btn-primary text-sm">
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
                            ×
                        </button>

                        <h2 className="text-3xl font-bold gradient-text mb-2">
                            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {authMode === 'login' ? 'Sign in to continue' : 'Join us and start your journey'}
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {authMode === 'register' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setRole('APPLICANT')}
                                            className={`py-3 rounded-lg font-semibold ${role === 'APPLICANT' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Job Seeker
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('RECRUITER')}
                                            className={`py-3 rounded-lg font-semibold ${role === 'RECRUITER' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            Recruiter
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </>
                            )}

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {authMode === 'register' && (
                                <>
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {role === 'RECRUITER' ? (
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Skills (comma separated)"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </>
                            )}

                            <button type="submit" disabled={authLoading} className="w-full btn-primary disabled:opacity-50">
                                {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-gray-600">
                            {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                {authMode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold gradient-text mb-4">
                        Find Your Dream Job Today
                    </h1>
                    <p className="text-xl text-gray-600">
                        {loading ? 'Loading...' : `${jobs.length} opportunities waiting for you`}
                    </p>
                </div>

                {/* Jobs */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="card p-16 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-2xl font-bold mb-2">No Jobs Available</h3>
                        <p className="text-gray-600">Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="card p-6">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                        {job.recruiter?.companyName?.charAt(0) || 'C'}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                                        <p className="text-gray-600 font-medium mb-3">{job.recruiter?.companyName || 'Company'}</p>

                                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                                            {job.location && <span className="text-gray-600">📍 {job.location}</span>}
                                            {job.jobType && <span className="text-gray-600">💼 {job.jobType}</span>}
                                            {job.salary && <span className="text-green-600 font-semibold">💰 {job.salary}</span>}
                                        </div>

                                        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                                                <span key={idx} className="badge badge-blue">{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={() => handleApplyClick(job.id)} className="btn-primary whitespace-nowrap">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
