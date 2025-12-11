import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';
import apiClient from '../services/api';

interface Application {
    id: string;
    job: {
        title: string;
        recruiter: {
            companyName: string;
        };
    };
    status: string;
    matchScore: number;
    appliedAt: string;
}

const STEPS = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];

export default function MyApplications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'APPLICANT') {
            navigate('/');
            return;
        }
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await apiClient.get('/applications/my/applications');
            setApplications(response.data.applications);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStepIndex = (status: string) => {
        const index = STEPS.indexOf(status);
        if (status === 'REJECTED') return -1; // Special case
        return index;
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
                            <img src="/logo.png" alt="ATS Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">ATS</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
                    <p className="text-gray-500">Track your job applications in real-time</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl text-center border border-dashed border-gray-300">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
                        <p className="text-gray-500 mb-6">Your dream job is just a click away.</p>
                        <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((app) => {
                            const currentStep = getStepIndex(app.status);
                            const isRejected = app.status === 'REJECTED';

                            return (
                                <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                                    {isRejected && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Application Ended</div>}

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{app.job.title}</h3>
                                            <p className="text-gray-600 font-medium">{app.job.recruiter.companyName}</p>
                                            <p className="text-xs text-gray-400 mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                                <span className="text-sm font-bold text-blue-700">{app.matchScore}% Match</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Tracker */}
                                    <div className="mt-8 relative px-4">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 rounded-full z-0"></div>

                                        {/* Active Progress Bar */}
                                        {!isRejected && (
                                            <div
                                                className="absolute top-4 left-0 h-1 bg-green-500 rounded-full z-0 transition-all duration-1000 ease-out"
                                                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                                            ></div>
                                        )}

                                        <div className="relative z-10 flex justify-between">
                                            {STEPS.map((step, index) => {
                                                const isActive = index <= currentStep;
                                                const isCurrent = index === currentStep;

                                                return (
                                                    <div key={step} className="flex flex-col items-center group">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-white
                                                            ${isRejected ? 'border-gray-300 text-gray-300' :
                                                                isActive ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-300'}
                                                            ${isCurrent && !isRejected ? 'scale-110 shadow-lg ring-4 ring-green-50' : ''}
                                                        `}>
                                                            {isActive && !isRejected ? '✓' : index + 1}
                                                        </div>
                                                        <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide transition-colors duration-300
                                                            ${isRejected ? 'text-gray-300' :
                                                                isActive ? 'text-green-600' : 'text-gray-300'}
                                                        `}>{step}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {isRejected && (
                                        <div className="mt-6 bg-red-50 p-4 rounded-lg flex items-center gap-3">
                                            <span className="text-xl">😔</span>
                                            <div>
                                                <p className="font-bold text-red-800 text-sm">Not Selected</p>
                                                <p className="text-red-600 text-xs"> unfortunately, the recruiter has decided not to move forward with your application.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
