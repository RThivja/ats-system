import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import '../styles/theme.css';
import apiClient from '../services/api';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        skills: '',
        experience: 'ENTRY',
        education: 'BACHELOR',
        resumeUrl: '',
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'APPLICANT') {
            navigate('/');
            return;
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/users/profile');
            if (response.data) {
                const data = response.data;
                console.log('Fetched profile:', data);
                setProfile(data);

                // Parse skills properly
                let skillsString = '';
                if (Array.isArray(data.skills)) {
                    skillsString = data.skills.join(', ');
                } else if (typeof data.skills === 'string') {
                    try {
                        const parsed = JSON.parse(data.skills);
                        skillsString = Array.isArray(parsed) ? parsed.join(', ') : data.skills;
                    } catch {
                        skillsString = data.skills;
                    }
                }

                setFormData({
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone || '',
                    skills: skillsString,
                    experience: data.experience || 'ENTRY',
                    education: data.education || 'BACHELOR',
                    resumeUrl: data.resumeUrl || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            setToast({ message: 'Name is required!', type: 'error' });
            return;
        }
        if (!formData.skills.trim()) {
            setToast({ message: 'Skills are required!', type: 'error' });
            return;
        }

        try {
            // const token = localStorage.getItem('token'); // Removed unused
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            if (skillsArray.length === 0) {
                setToast({ message: 'Please enter at least one skill!', type: 'error' });
                return;
            }

            // Upload CV file if selected
            let resumeUrl = formData.resumeUrl;
            if (cvFile) {
                setUploading(true);
                const formDataCV = new FormData();
                formDataCV.append('cv', cvFile);

                const uploadResponse = await apiClient.post('/upload/cv', formDataCV, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setUploading(false);

                if (uploadResponse.data) {
                    resumeUrl = `${BASE_URL}${uploadResponse.data.url}`;
                } else {
                    setToast({ message: 'Failed to upload CV', type: 'error' });
                    return;
                }
            }

            const response = await apiClient.put('/users/applicant/profile', {
                name: formData.name,
                phone: formData.phone,
                skills: skillsArray,
                experience: formData.experience,
                education: formData.education,
                resumeUrl: resumeUrl,
            });

            if (response.data) {
                const updatedData = response.data;
                console.log('Updated profile:', updatedData);
                setToast({ message: '✨ Profile updated successfully!', type: 'success' });
                setEditing(false);
                setCvFile(null);
                await fetchProfile();
            }
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            const msg = error.response?.data?.error || 'Failed to update profile';
            setToast({ message: msg, type: 'error' });
        }
    };

    return (
        <div className="page-bg min-h-screen">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700 font-medium">
                        ← Back to Jobs
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text">My Profile</h1>
                    {!editing && (
                        <button onClick={() => setEditing(true)} className="btn-primary">
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="card p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                ) : editing ? (
                    <form onSubmit={handleUpdate} className="card p-8 space-y-6">
                        <div>
                            <label className="block font-medium mb-2">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Email (Read-only)</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Skills (comma separated) *</label>
                            <input
                                type="text"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. React, Node.js, Python"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2">Experience Level *</label>
                                <select
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ENTRY">Entry Level</option>
                                    <option value="JUNIOR">Junior Level</option>
                                    <option value="MID">Mid Level</option>
                                    <option value="SENIOR">Senior Level</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Education *</label>
                                <select
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="HIGH_SCHOOL">High School</option>
                                    <option value="BACHELOR">Bachelor's Degree</option>
                                    <option value="MASTER">Master's Degree</option>
                                    <option value="PHD">PhD</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Upload CV (Optional)</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setCvFile(e.target.files[0]);
                                    }
                                }}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {cvFile && (
                                <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                                    <p className="text-sm text-green-600">✅ {cvFile.name}</p>
                                    <button
                                        type="button"
                                        onClick={() => setCvFile(null)}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            {formData.resumeUrl && !cvFile && (
                                <p className="text-sm text-blue-600 mt-2">📄 Current CV uploaded</p>
                            )}
                            {uploading && (
                                <p className="text-sm text-orange-600 mt-2">⏳ Uploading...</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button type="submit" className="btn-primary flex-1">
                                💾 Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    fetchProfile();
                                }}
                                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="card p-8">
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Name</p>
                                <p className="text-lg font-semibold">{profile?.user.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Email</p>
                                <p className="text-lg">{profile?.user.email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Phone</p>
                                <p className="text-lg">{profile?.user.phone || 'Not provided'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        let skillsArray = [];
                                        if (Array.isArray(profile?.skills)) {
                                            skillsArray = profile.skills;
                                        } else if (typeof profile?.skills === 'string') {
                                            try {
                                                skillsArray = JSON.parse(profile.skills);
                                            } catch {
                                                skillsArray = profile.skills.split(',').map((s: string) => s.trim());
                                            }
                                        }

                                        if (skillsArray.length === 0) {
                                            return <span className="text-gray-400">No skills added</span>;
                                        }

                                        return skillsArray.map((skill: string, idx: number) => (
                                            <span key={idx} className="badge badge-blue">{skill}</span>
                                        ));
                                    })()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Experience</p>
                                    <p className="text-lg font-semibold">{profile?.experience || 'Not specified'}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Education</p>
                                    <p className="text-lg font-semibold">{profile?.education || 'Not specified'}</p>
                                </div>
                            </div>

                            {profile?.resumeUrl && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Resume</p>
                                    <a
                                        href={profile.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        📄 View Resume →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
