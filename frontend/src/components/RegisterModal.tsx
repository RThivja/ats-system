import { useState } from 'react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    const [role, setRole] = useState<'RECRUITER' | 'APPLICANT'>('APPLICANT');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        skills: '',
        experience: 'ENTRY' as const,
        education: 'BACHELOR' as const,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role,
                    skills: role === 'APPLICANT' ? formData.skills.split(',').map(s => s.trim()) : undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on role
                if (role === 'RECRUITER') {
                    window.location.href = '/recruiter/dashboard';
                } else {
                    window.location.href = '/applicant/jobs';
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative my-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Create Account
                    </h2>
                    <p className="text-gray-600">Join us and start your journey</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole('APPLICANT')}
                            className={`py-3 rounded-lg font-semibold transition ${role === 'APPLICANT'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Job Seeker
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('RECRUITER')}
                            className={`py-3 rounded-lg font-semibold transition ${role === 'RECRUITER'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            Recruiter
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {role === 'RECRUITER' ? (
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <input
                            type="text"
                            placeholder="Skills (comma separated)"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
