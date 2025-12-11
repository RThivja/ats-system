import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import Toast from '../components/Toast';
import '../styles/theme.css';
import apiClient from '../services/api';

interface Application {
  id: string;
  applicant: {
    user: {
      name: string;
      email: string;
      phone?: string;
    };
    skills: string[];
    experience: string;
    education: string;
    resumeUrl?: string;
  };
  analysis?: {
    matchedSkills: string[];
    missingSkills: string[];
  };
  coverLetter?: string;
  status: string;
  matchScore: number;
  appliedAt: string;
}

export default function ViewApplications() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RESUME'>('OVERVIEW');

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(0); // Added back

  // Debounce Search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') { navigate('/'); return; }
    fetchApplications();
  }, [page, filterType, debouncedSearch, minMatchScore]); // Added dependency

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (filterType !== 'ALL') params.append('status', filterType);
      if (debouncedSearch) params.append('skill', debouncedSearch);
      if (minMatchScore > 0) params.append('minMatchScore', minMatchScore.toString()); // Added param

      const response = await apiClient.get(`/applications/job/${jobId}?${params.toString()}`);
      if (response.data) {
        setApplications(response.data.applications);
        setTotalPages(response.data.pagination?.totalPages || 1);

        if (!selectedApp && response.data.applications.length > 0) {
          setSelectedApp(response.data.applications[0]);
        } else if (response.data.applications.length === 0) {
          setSelectedApp(null);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-Update Status
  useEffect(() => {
    if (selectedApp && selectedApp.status === 'APPLIED') {
      const timer = setTimeout(() => {
        setSelectedApp(prev => prev ? { ...prev, status: 'VIEWED' } : null);
        setApplications(apps => apps.map(a => a.id === selectedApp.id ? { ...a, status: 'VIEWED' } : a));

        apiClient.patch(`/applications/${selectedApp.id}/status`, { status: 'VIEWED' })
          .catch(err => console.error("Auto-view failed", err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedApp?.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedApp) return;
    try {
      const updated = { ...selectedApp, status: newStatus };
      setSelectedApp(updated);
      setApplications(apps => apps.map(a => a.id === selectedApp.id ? updated : a));

      await apiClient.patch(`/applications/${selectedApp.id}/status`, { status: newStatus });
      setToast({ message: `Marked as ${newStatus}`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <RecruiterHeader />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Candidate List */}
        <div className="w-[400px] min-w-[350px] bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Candidates ({applications.length})</h2>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by Skill..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Score Filter */}
            <div>
              <select
                value={minMatchScore}
                onChange={e => setMinMatchScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value={0}>All Match Scores</option>
                <option value={80}>🔥 Top Match (80%+)</option>
                <option value={50}>✅ Good Match (50%+)</option>
                <option value={30}>⚠️ Low Match (30%+)</option>
              </select>
            </div>

            {/* Status Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['ALL', 'SHORTLISTED', 'REJECTED', 'APPLIED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterType(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterType === status
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">🕵️</p>
                <p>No candidates found</p>
              </div>
            ) : (
              applications.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedApp?.id === app.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm truncate pr-2 ${selectedApp?.id === app.id ? 'text-blue-900' : 'text-gray-900'}`}>
                      {app.applicant.user.name}
                    </h3>
                    <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${app.matchScore >= 80 ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                      {app.matchScore}%
                    </div>
                  </div>

                  {app.analysis?.missingSkills && app.analysis.missingSkills.length > 0 && (
                    <div className="text-xs text-red-500 mb-1 truncate">
                      Missing: {app.analysis.missingSkills.slice(0, 3).join(', ')}
                      {app.analysis.missingSkills.length > 3 && '...'}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'VIEWED' ? 'bg-purple-100 text-purple-700' :
                          app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                      }`}>
                      {app.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-50">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-50">Next</button>
          </div>
        </div>

        {/* RIGHT PANEL: Details */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
          {selectedApp ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedApp.applicant.user.name[0]}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">{selectedApp.applicant.user.name}</h1>
                    <p className="text-xs text-gray-500">{selectedApp.applicant.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('SHORTLISTED')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded shadow-sm transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="px-6 border-b border-gray-200 flex gap-6 shrink-0 bg-gray-50">
                <button
                  onClick={() => setActiveTab('OVERVIEW')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'OVERVIEW' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('RESUME')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'RESUME' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Resume <span className="text-xs bg-gray-200 text-gray-600 px-1.5 rounded-full ml-1">PDF</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                {activeTab === 'OVERVIEW' && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">AI Skill Analysis</h3>
                        <span className={`text-lg font-bold ${selectedApp.matchScore >= 70 ? 'text-green-600' : 'text-blue-600'
                          }`}>{selectedApp.matchScore}% Match</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded border border-green-100">
                          <p className="text-xs font-bold text-green-800 mb-2">MATCHED SKILLS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedApp.analysis?.matchedSkills.length ? selectedApp.analysis.matchedSkills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-white text-green-700 text-xs rounded border border-green-200 shadow-sm">✓ {s}</span>
                            )) : <span className="text-gray-400 text-xs">None (Check fuzzy match)</span>}
                          </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                          <p className="text-xs font-bold text-red-800 mb-2">MISSING SKILLS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedApp.analysis?.missingSkills.length ? selectedApp.analysis.missingSkills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-white text-gray-500 text-xs rounded border border-red-100 shadow-sm line-through">{s}</span>
                            )) : <span className="text-gray-400 text-xs">None</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Qualifications</h3>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Experience</p>
                          <p className="font-medium text-gray-900 mt-1">{selectedApp.applicant.experience}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Education</p>
                          <p className="font-medium text-gray-900 mt-1">{selectedApp.applicant.education}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'RESUME' && (
                  <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {selectedApp.applicant.resumeUrl ? (
                      <iframe
                        src={selectedApp.applicant.resumeUrl}
                        className="w-full h-full"
                        title="Resume"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="text-4xl mb-4">📄</div>
                        <p>No Resume Uploaded</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <p>Select a candidate to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
