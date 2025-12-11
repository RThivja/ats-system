import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

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

const statusColors: Record<string, string> = {
    APPLIED: 'badge-blue',
    VIEWED: 'badge-purple',
    SHORTLISTED: 'badge-green',
    INTERVIEW: 'badge-blue',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    HIRED: 'badge-green',
};

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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/applications/my/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-bg min-h-screen">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700 font-medium">
                        ← Back to Jobs
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold gradient-text mb-8">My Applications</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="card p-16 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-2xl font-bold mb-2">No Applications Yet</h3>
                        <p className="text-gray-600 mb-6">Start applying to jobs to see them here!</p>
                        <button onClick={() => navigate('/')} className="btn-primary">
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="card p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{app.job.title}</h3>
                                        <p className="text-gray-600 mb-3">{app.job.recruiter.companyName}</p>

                                        <div className="flex items-center gap-3">
                                            <span className={`badge ${statusColors[app.status]}`}>
                                                {app.status}
                                            </span>
                                            <span className="badge badge-blue">
                                                🎯 {app.matchScore}% Match
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Applied {new Date(app.appliedAt).toLocaleDateString()}
                                            </span>
                                        </div>
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
