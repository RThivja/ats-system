import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import '../styles/theme.css';
import apiClient from '../services/api';

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
            const response = await apiClient.get('/users/recruiter/dashboard');
            const data = response.data;
            const statsData = data.stats || data;

            setStats({
                totalJobs: statsData.totalJobs || 0,
                totalApplications: statsData.totalApplications || 0,
                pendingReview: statsData.applicationsByStatus?.APPLIED || 0,
                shortlisted: statsData.applicationsByStatus?.SHORTLISTED || 0,
            });

            // Group pending applications by job
            const pendingByJob = new Map<string, { jobTitle: string, count: number }>();
            if (data.recentApplications) {
                data.recentApplications.forEach((app: any) => {
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
            }

            const pendingList = Array.from(pendingByJob.entries()).map(([jobId, data]) => ({
                jobId,
                jobTitle: data.jobTitle,
                count: data.count
            }));
            setPendingJobs(pendingList);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <RecruiterHeader />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
                    </div>
                    <span className="text-sm text-gray-400">{new Date().toLocaleDateString()}</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* 1. Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div
                                onClick={() => navigate('/my-jobs')}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <span className="text-xl">💼</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalJobs}</p>
                                <p className="text-sm text-gray-500">Active Jobs Posting</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <span className="text-xl">👥</span>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Total</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalApplications}</p>
                                <p className="text-sm text-gray-500">Candidates Applied</p>
                            </div>

                            <div
                                onClick={() => stats.pendingReview > 0 && navigate(`/applications/${pendingJobs[0]?.jobId || ''}`)}
                                className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden ${stats.pendingReview > 0 ? 'cursor-pointer hover:shadow-md ring-2 ring-orange-100' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <span className="text-xl">⏳</span>
                                    </div>
                                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Action Needed</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{stats.pendingReview}</p>
                                <p className="text-sm text-gray-500 relative z-10">Pending Review</p>
                                {/* Decorative BG circle */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-50"></div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <span className="text-xl">⭐</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Qualified</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{stats.shortlisted}</p>
                                <p className="text-sm text-gray-500">Shortlisted Candidates</p>
                            </div>
                        </div>

                        {/* 2. Quick Actions Section (Moved to Middle) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h2>
                            <p className="text-sm text-gray-500 mb-6">Manage your recruiting pipeline efficiently</p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => navigate('/create-job')}
                                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md group"
                                >
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 text-lg">➕</div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Post New Job</p>
                                        <p className="text-xs text-blue-100">Create a new listing</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/my-jobs')}
                                    className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 text-lg">📋</div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Manage Jobs</p>
                                        <p className="text-xs text-gray-500">View active listings</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 3. Pending Reviews (Moved to Bottom) */}
                        {stats.pendingReview > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="flex h-3 w-3 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                            </span>
                                            Pending Reviews
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">Candidates waiting for your response</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/applications/${pendingJobs[0]?.jobId}`)}
                                        className="text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline"
                                    >
                                        Review All
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {pendingJobs.map((job) => (
                                        <div key={job.jobId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                                                    {job.count}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{job.jobTitle}</p>
                                                    <p className="text-sm text-gray-500">New applicants applied recently</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/applications/${job.jobId}`)}
                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-600 font-medium text-sm transition-colors"
                                            >
                                                Review Candidates →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
