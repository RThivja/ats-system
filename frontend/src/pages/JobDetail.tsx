import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

interface Job {
    id: string;
    title: string;
    description: string;
    location?: string;
    jobType?: string;
    salary?: string;
    requiredSkills: string[];
    experienceRequired: string;
    educationRequired: string;
    otherRequirements?: string;
    recruiter: {
        companyName: string;
        user: {
            name: string;
            email: string;
        };
    };
}

export default function JobDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeUrl, setResumeUrl] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'APPLICANT') {
            navigate('/');
            return;
        }
        fetchJob();
        checkIfApplied();
        fetchProfile(); // Auto-fill CV from profile
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
            if (response.ok) {
                const data = await response.json();
                setJob(data.job);
            }
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Auto-fill CV if available in profile
                if (data.resumeUrl) {
                    setResumeUrl(data.resumeUrl);
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const checkIfApplied = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/applications/my/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const applied = data.applications.some((app: any) => app.jobId === id);
                setAlreadyApplied(applied);
            }
        } catch (error) {
            console.error('Failed to check application:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setResumeFile(file);
            setResumeUrl('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setApplying(true);

        try {
            let resumeData = resumeUrl;

            if (resumeFile) {
                const reader = new FileReader();
                resumeData = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(resumeFile);
                });
            }

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/applications/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    jobId: id,
                    coverLetter,
                    resumeData
                })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/my-applications'), 2000);
            } else {
                const data = await response.json();
                setError(data.error || 'Application failed');
            }
        } catch (err) {
            setError('Application failed');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-gray-600">Job not found</p>
                    <button onClick={() => navigate('/')} className="btn-primary mt-4">
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-bg min-h-screen">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700 font-medium">
                        ← Back to Jobs
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Job Details */}
                <div className="card p-8 mb-6">
                    <div className="flex items-start gap-6 mb-6">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                            {job.recruiter.companyName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                            <p className="text-xl text-gray-600 mb-4">{job.recruiter.companyName}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                {job.location && <span className="text-gray-600">📍 {job.location}</span>}
                                {job.jobType && <span className="text-gray-600">💼 {job.jobType}</span>}
                                {job.salary && <span className="text-green-600 font-semibold">💰 {job.salary}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg mb-2">Job Description</h3>
                            <p className="text-gray-700">{job.description}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-2">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill, idx) => (
                                    <span key={idx} className="badge badge-blue">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-bold mb-1">Experience Required</h3>
                                <p className="text-gray-700">{job.experienceRequired}</p>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Education Required</h3>
                                <p className="text-gray-700">{job.educationRequired}</p>
                            </div>
                        </div>

                        {job.otherRequirements && (
                            <div>
                                <h3 className="font-bold text-lg mb-2">Other Requirements</h3>
                                <p className="text-gray-700">{job.otherRequirements}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Application Form */}
                {alreadyApplied ? (
                    <div className="card p-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold mb-2">Already Applied!</h3>
                        <p className="text-gray-600 mb-6">You have already applied to this job</p>
                        <button onClick={() => navigate('/my-applications')} className="btn-primary">
                            View My Applications
                        </button>
                    </div>
                ) : success ? (
                    <div className="card p-8 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                        <p className="text-gray-600">Redirecting to your applications...</p>
                    </div>
                ) : (
                    <div className="card p-8">
                        <h2 className="text-2xl font-bold mb-6">Apply for this Position</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block font-medium mb-2">Cover Letter</label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell us why you're a great fit for this role..."
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Resume</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Upload File (PDF/Word, max 5MB)</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                        {resumeFile && (
                                            <p className="text-sm text-green-600 mt-2">✓ {resumeFile.name}</p>
                                        )}
                                    </div>
                                    <div className="text-center text-gray-500">OR</div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Resume URL (Google Drive, Dropbox, etc.)</label>
                                        <input
                                            type="url"
                                            value={resumeUrl}
                                            onChange={(e) => { setResumeUrl(e.target.value); setResumeFile(null); }}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://..."
                                        />
                                        {resumeUrl && !resumeFile && (
                                            <p className="text-sm text-green-600 mt-2">✅ CV from your profile will be used</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={applying} className="w-full btn-primary disabled:opacity-50">
                                {applying ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
