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
        currentTitle: '', // Mapped to bio
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [strength, setStrength] = useState(0);

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
                setProfile(data);

                let skillsString = '';
                let skillsCount = 0;
                if (Array.isArray(data.skills)) {
                    skillsString = data.skills.join(', ');
                    skillsCount = data.skills.length;
                } else if (typeof data.skills === 'string') {
                    try {
                        const parsed = JSON.parse(data.skills);
                        skillsString = Array.isArray(parsed) ? parsed.join(', ') : data.skills;
                        skillsCount = Array.isArray(parsed) ? parsed.length : (data.skills ? 1 : 0);
                    } catch {
                        skillsString = data.skills;
                        skillsCount = data.skills ? 1 : 0;
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
                    currentTitle: data.bio || '',
                });

                // Calculate Strength
                let s = 20;
                if (data.user.phone) s += 10;
                if (skillsCount > 0) s += 30;
                if (data.resumeUrl) s += 20;
                if (data.experience) s += 10;
                if (data.education) s += 10;
                setStrength(Math.min(100, s));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setToast({ message: 'Name is required!', type: 'error' });
            return;
        }
        if (!formData.skills.trim()) {
            setToast({ message: 'Skills are required!', type: 'error' });
            return;
        }

        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            if (skillsArray.length === 0) {
                setToast({ message: 'Please enter at least one skill!', type: 'error' });
                return;
            }

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
                bio: formData.currentTitle, // Saving title to bio
            });

            if (response.data) {
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
        <div className="bg-gray-50 min-h-screen font-sans">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2">
                        ← Back to Jobs
                    </button>
                    {!editing && (
                        <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">

                {/* Profile Strength Card */}
                {!editing && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="40" cy="40" r="36" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                                <circle cx="40" cy="40" r="36" stroke={strength === 100 ? "#10b981" : "#3b82f6"} strokeWidth="8" fill="none" strokeDasharray={`${strength * 2.26}, 1000`} />
                            </svg>
                            <span className="absolute text-lg font-bold text-gray-800">{strength}%</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-bold text-gray-900">Profile Strength</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {strength === 100 ? "You are an All-Star! Ready to open doors." : "Complete your profile to unlock 'Easy Apply' and better matches."}
                            </p>
                        </div>
                        {strength < 100 && (
                            <button onClick={() => setEditing(true)} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow hover:bg-black transition-all">
                                Complete Now
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading profile...</div>
                ) : editing ? (
                    <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                            <p className="text-gray-500 mt-1">Make changes to your candidate profile</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Title / Role</label>
                                    <input
                                        type="text"
                                        value={formData.currentTitle}
                                        onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email (Locked)</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Skills</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    placeholder="e.g. React, Node.js, Python (Comma separated)"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">These act as keywords for the AI matcher. Be specific!</p>
                            </div>

                            {/* Experience & Education */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
                                    <select
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ENTRY">Entry Level (0-2 years)</option>
                                        <option value="JUNIOR">Junior (2-4 years)</option>
                                        <option value="MID">Mid-Level (4-6 years)</option>
                                        <option value="SENIOR">Senior (6+ years)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Education</label>
                                    <select
                                        value={formData.education}
                                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="HIGH_SCHOOL">High School</option>
                                        <option value="BACHELOR">Bachelor's Degree</option>
                                        <option value="MASTER">Master's Degree</option>
                                        <option value="PHD">PhD</option>
                                    </select>
                                </div>
                            </div>

                            {/* Resume Upload */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <label className="block text-sm font-bold text-blue-900 mb-4">Resume / CV</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) setCvFile(e.target.files[0]);
                                            }}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                {formData.resumeUrl && <p className="text-xs text-blue-600 mt-2">Current: <a href={formData.resumeUrl} target="_blank" className="underline">View PDF</a></p>}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-6 py-3 bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-700 shadow-lg disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                                    {profile?.user.name[0]}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{profile?.user.name}</h2>
                                {formData.currentTitle && <p className="text-blue-600 font-medium text-sm mb-1">{formData.currentTitle}</p>}
                                <p className="text-gray-500 text-sm mb-4">{profile?.user.email}</p>

                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Exp</p>
                                        <p className="font-bold text-gray-800">{profile?.experience}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Edu</p>
                                        <p className="font-bold text-gray-800">{profile?.education}</p>
                                    </div>
                                </div>
                            </div>

                            {profile?.resumeUrl && (
                                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="block w-full py-3 bg-white border border-gray-200 text-center rounded-xl shadow-sm hover:shadow-md transition-shadow font-bold text-gray-700">
                                    📄 View Resume
                                </a>
                            )}
                        </div>

                        {/* Main Details */}
                        <div className="md:col-span-2">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Skills & Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.split(',').map((skill, idx) => (
                                        skill.trim() && (
                                            <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                                                {skill.trim()}
                                            </span>
                                        )
                                    ))}
                                    {!formData.skills && <p className="text-gray-400 italic">No skills added yet.</p>}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Email</p>
                                        <p className="font-medium text-gray-900">{formData.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Phone</p>
                                        <p className="font-medium text-gray-900">{formData.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
