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
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [jobError, setJobError] = useState<string | null>(null);

    const { user, login, register, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'RECRUITER') {
            navigate('/dashboard');
            return;
        }
        fetchJobs();
    }, [user]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/jobs');
            setJobs(response.data.jobs || []);
        } catch (error: any) {
            console.error('Failed to fetch jobs:', error);
            setJobError(error.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleJobClick = (jobId: string) => {
        // Go to public details page first. Login only needed to apply.
        navigate(`/job/${jobId}`);
    };

    const openRecruiterSignup = () => {
        setAuthMode('register');
        setRole('RECRUITER');
        setShowAuthModal(true);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAuthLoading(true);

        try {
            if (authMode === 'login') {
                await login(email, password);
                setShowAuthModal(false);
                window.location.reload();
            } else {
                await register({
                    name,
                    email,
                    password,
                    phone,
                    role,
                    companyName: role === 'RECRUITER' ? companyName : undefined,
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

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.recruiter.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Sticky Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 transition-all">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">ATS</span>
                    </div>

                    <nav className="flex items-center gap-6">
                        {user ? (
                            <>
                                <button onClick={() => navigate('/my-applications')} className="text-gray-600 hover:text-blue-600 font-medium text-sm">Applications</button>
                                <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-blue-600 font-medium text-sm">Profile</button>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <button onClick={() => { logout(); navigate('/'); }} className="text-red-600 hover:text-red-700 font-medium text-sm">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={openRecruiterSignup} className="hidden md:block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold shadow hover:bg-black transition">
                                    Post a Job
                                </button>
                                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-gray-600 hover:text-blue-600 font-medium text-sm">Log In</button>
                                <button onClick={() => { setAuthMode('register'); setRole('APPLICANT'); setShowAuthModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                            <p className="text-gray-500 text-sm mt-1">{authMode === 'login' ? 'Login to access your dashboard' : (role === 'RECRUITER' ? 'Start hiring top talent today' : 'Find your next dream job')}</p>
                        </div>

                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {authMode === 'register' && (
                                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                    <button type="button" onClick={() => setRole('APPLICANT')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'APPLICANT' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Job Seeker</button>
                                    <button type="button" onClick={() => setRole('RECRUITER')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'RECRUITER' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Recruiter</button>
                                </div>
                            )}

                            {authMode === 'register' && (
                                <>
                                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    {role === 'RECRUITER' && (
                                        <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                    )}
                                </>
                            )}

                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />

                            <button type="submit" disabled={authLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-70">
                                {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            {authMode === 'login' ? "New here? " : "Already have an account? "}
                            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-600 font-bold hover:underline">
                                {authMode === 'login' ? 'Sign up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative bg-gray-900 py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/20 blur-3xl rounded-full translate-x-1/2"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        Find the job that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Fits You.</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        AI-powered matching to connect you with roles where you'll excel. No more guessing.
                    </p>

                    <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center max-w-2xl mx-auto">
                        <span className="pl-4 text-2xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by title, skill, or company..."
                            className="flex-1 px-4 py-3 outline-none text-lg text-gray-800 placeholder-gray-400"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Job Listings */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
                    <span className="text-gray-500 text-sm">{filteredJobs.length} jobs found</span>
                </div>

                {jobError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        <p className="font-bold">Error Loading Jobs</p>
                        <p className="text-sm">{jobError}</p>
                        <p className="text-xs mt-1 text-red-500">Backend URL: {apiClient.defaults.baseURL}</p>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-4">🤔</div>
                        <h3 className="text-xl font-bold text-gray-900">No jobs found</h3>
                        <p className="text-gray-500">Try adjusting your search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map(job => (
                            <div key={job.id} onClick={() => handleJobClick(job.id)} className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl font-bold text-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {job.recruiter.companyName.charAt(0)}
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{job.recruiter.companyName}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.location && <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{job.location}</span>}
                                    {job.salary && <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">{job.salary}</span>}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex flex-wrap gap-1.5 overflow-hidden h-6">
                                        {job.requiredSkills.slice(0, 3).map((s, i) => (
                                            <span key={i} className="text-[10px] text-gray-500 border border-gray-200 px-1.5 rounded bg-white">{s}</span>
                                        ))}
                                        {job.requiredSkills.length > 3 && <span className="text-[10px] text-gray-400 pl-1">+{job.requiredSkills.length - 3}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
