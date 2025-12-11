import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import '../styles/theme.css';
import apiClient from '../services/api';

export default function CreateJob() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: '',
        experienceRequired: 'ENTRY',
        educationRequired: 'BACHELOR',
        location: '',
        jobType: 'FULL_TIME',
        salary: '',
        otherRequirements: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user || user.role !== 'RECRUITER') {
        navigate('/');
        return null; // Handle effectively in useEffect normally
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiClient.post('/jobs', {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            });
            navigate('/my-jobs');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <RecruiterHeader />

            <div className="bg-gray-900 h-64 w-full absolute top-0 z-0">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Post a New Job</h1>
                    <button onClick={() => navigate('/my-jobs')} className="text-gray-300 hover:text-white text-sm">Cancel</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 border-b border-red-100 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="p-8 space-y-8">
                                {/* Section 1: Basics */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Role Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="e.g. Senior Product Designer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                required
                                                rows={5}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="Describe the role's mission and responsibilities..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Requirements */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Requirements & Skills</h3>
                                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-800 font-bold">🤖 AI Matching Tip</p>
                                        <p className="text-xs text-blue-700 mt-1">Specific skills (e.g. "React.js" instead of "Fronend") help our AI find better candidates.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Required Skills (Comma separated)</label>
                                            <input
                                                type="text"
                                                value={formData.requiredSkills}
                                                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="React, Node.js, TypeScript"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Experience</label>
                                                <select
                                                    value={formData.experienceRequired}
                                                    onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="ENTRY">Entry Level</option>
                                                    <option value="MID">Mid Level</option>
                                                    <option value="SENIOR">Senior Level</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Education</label>
                                                <select
                                                    value={formData.educationRequired}
                                                    onChange={(e) => setFormData({ ...formData, educationRequired: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="HIGH_SCHOOL">High School</option>
                                                    <option value="BACHELOR">Bachelor's Degree</option>
                                                    <option value="MASTER">Master's Degree</option>
                                                    <option value="PHD">PhD</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Logistics */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Logistics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="e.g. Remote"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Salary Range</label>
                                            <input
                                                type="text"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="e.g. $80k - $120k"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => navigate('/my-jobs')} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70">
                                    {loading ? 'Publishing...' : 'Publish Job'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar Tips */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">Recruiter Tips</h4>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500">✓</span>
                                    Be specific with job titles.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500">✓</span>
                                    List technical skills clearly.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500">✓</span>
                                    Salary transparency increases applications by 40%.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
