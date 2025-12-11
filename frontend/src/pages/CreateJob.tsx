import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import '../styles/theme.css';

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
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
                })
            });

            if (response.ok) {
                navigate('/my-jobs');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create job');
            }
        } catch (err) {
            setError('Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-bg min-h-screen">
            <RecruiterHeader />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold gradient-text mb-8">Post a New Job</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    <div>
                        <label className="block font-medium mb-2">Job Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Job Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={6}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the role, responsibilities, and what you're looking for..."
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Required Skills * (comma separated)</label>
                        <input
                            type="text"
                            value={formData.requiredSkills}
                            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. React, Node.js, TypeScript, MongoDB"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-2">Experience Required *</label>
                            <select
                                value={formData.experienceRequired}
                                onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ENTRY">Entry Level (0-2 years)</option>
                                <option value="MID">Mid Level (2-5 years)</option>
                                <option value="SENIOR">Senior Level (5+ years)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Education Required *</label>
                            <select
                                value={formData.educationRequired}
                                onChange={(e) => setFormData({ ...formData, educationRequired: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="HIGH_SCHOOL">High School</option>
                                <option value="BACHELOR">Bachelor's Degree</option>
                                <option value="MASTER">Master's Degree</option>
                                <option value="PHD">PhD</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-2">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Remote, New York, Hybrid"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Job Type</label>
                            <select
                                value={formData.jobType}
                                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Salary Range (Optional)</label>
                        <input
                            type="text"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. $80,000 - $120,000"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Other Requirements (Optional)</label>
                        <textarea
                            value={formData.otherRequirements}
                            onChange={(e) => setFormData({ ...formData, otherRequirements: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Any additional requirements or preferences..."
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
                        {loading ? 'Creating Job...' : 'Post Job'}
                    </button>
                </form>
            </main>
        </div>
    );
}
