import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import '../styles/theme.css';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplications: 0,
        pendingReview: 0,
        shortlisted: 0,
    });
    const [loading, setLoading] = useState(true);
    const [pendingJobs, setPendingJobs] = useState<Array<{ jobId: string, jobTitle: string, count: number }>>([]);

    useEffect(() => {
        if (!user || user.role !== 'RECRUITER') {
            navigate('/');
            return;
        }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/recruiter/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Dashboard data:', data); // Debug
                // Backend returns { stats: {...}, recentApplications: [...] }
                const statsData = data.stats || data;
                setStats({
                    totalJobs: statsData.totalJobs || 0,
                    totalApplications: statsData.totalApplications || 0,
                    pendingReview: statsData.applicationsByStatus?.APPLIED || 0, // Only APPLIED, not VIEWED
                    shortlisted: statsData.applicationsByStatus?.SHORTLISTED || 0,
                });

                // Group pending applications by job
                const pendingByJob = new Map<string, { jobTitle: string, count: number }>();
                data.recentApplications?.forEach((app: any) => {
                    if (app.status === 'APPLIED') {
                        const existing = pendingByJob.get(app.jobId);
                        if (existing) {
                            existing.count++;
                        } else {
                            pendingByJob.set(app.jobId, {
                                jobTitle: app.job?.title || 'Job',
                                count: 1
                            });
                        }
                    }
                });

                const pendingList = Array.from(pendingByJob.entries()).map(([jobId, data]) => ({
                    jobId,
                    jobTitle: data.jobTitle,
                    count: data.count
                }));
                setPendingJobs(pendingList);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-bg min-h-screen">
            <RecruiterHeader />

            <main className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold gradient-text mb-8">Recruiter Dashboard</h1>

                {loading ? (
                    <div className="grid grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Pending Review Alert */}
                        {stats.pendingReview > 0 && (
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-6 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <p className="font-bold text-orange-800 text-lg">
                                            {stats.pendingReview} Application{stats.pendingReview > 1 ? 's' : ''} Pending Review
                                        </p>
                                        <p className="text-sm text-orange-700">
                                            Review applications to move candidates forward
                                        </p>
                                    </div>
                                </div>

                                {/* List of jobs with pending applications */}
                                <div className="space-y-2 mt-4">
                                    {pendingJobs.map((job) => (
                                        <div key={job.jobId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200">
                                            <div>
                                                <p className="font-semibold text-gray-800">{job.jobTitle}</p>
                                                <p className="text-sm text-gray-600">{job.count} pending application{job.count > 1 ? 's' : ''}</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/applications/${job.jobId}`)}
                                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-sm"
                                            >
                                                Review →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-6 mb-8">
                            <div
                                onClick={() => navigate('/my-jobs')}
                                className="card p-6 cursor-pointer hover:shadow-lg"
                            >
                                <p className="text-gray-600 mb-2">Total Jobs</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalJobs}</p>
                                <p className="text-xs text-gray-500 mt-2">Click to view →</p>
                            </div>
                            <div className="card p-6">
                                <p className="text-gray-600 mb-2">Total Applications</p>
                                <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
                            </div>
                            <div
                                onClick={() => {
                                    if (stats.pendingReview > 0) {
                                        if (pendingJobs.length > 0) {
                                            navigate(`/applications/${pendingJobs[0].jobId}`);
                                        } else {
                                            navigate('/my-jobs');
                                        }
                                    } else {
                                        alert('No pending applications to review!');
                                    }
                                }}
                                className={`card p-6 ${stats.pendingReview > 0 ? 'cursor-pointer hover:shadow-lg border-2 border-orange-200' : ''}`}
                            >
                                <p className="text-gray-600 mb-2">Pending Review</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.pendingReview}</p>
                                {stats.pendingReview > 0 && (
                                    <p className="text-xs text-orange-600 mt-2 font-semibold">Click to review →</p>
                                )}
                            </div>
                            <div className="card p-6">
                                <p className="text-gray-600 mb-2">Shortlisted</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.shortlisted}</p>
                            </div>
                        </div>

                        <div className="card p-8 text-center">
                            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => navigate('/create-job')} className="btn-primary">
                                    ➕ Post New Job
                                </button>
                                <button onClick={() => navigate('/my-jobs')} className="btn-primary">
                                    📋 View My Jobs
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
