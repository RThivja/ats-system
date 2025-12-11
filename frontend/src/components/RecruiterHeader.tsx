import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RecruiterHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user || user.role !== 'RECRUITER') return null;

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <header className="bg-white border-b shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
                            <img src="/logo.png" alt="ATS Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">ATS</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`font-medium transition px-3 py-2 rounded-lg ${isActive('/dashboard')
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/my-jobs')}
                            className={`font-medium transition px-3 py-2 rounded-lg ${isActive('/my-jobs') || isActive('/applications')
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            My Jobs
                        </button>
                        <button
                            onClick={() => navigate('/create-job')}
                            className="btn-primary text-sm"
                        >
                            ➕ Post Job
                        </button>

                        {/* User Menu */}
                        <div className="border-l pl-4 flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold">{user.name}</p>
                                <p className="text-xs text-gray-500">Recruiter</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="text-red-600 hover:text-red-700 font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
