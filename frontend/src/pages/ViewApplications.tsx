import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import '../styles/theme.css';

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
  coverLetter?: string;
  status: string;
  matchScore: number;
  appliedAt: string;
}

const statusOptions = [
  { value: 'APPLIED', label: '📋 Applied', color: 'badge-blue' },
  { value: 'VIEWED', label: '👀 Viewed', color: 'badge-purple' },
  { value: 'SHORTLISTED', label: '⭐ Shortlisted', color: 'badge-green' },
  { value: 'INTERVIEW', label: '📞 Interview', color: 'badge-blue' },
  { value: 'REJECTED', label: '❌ Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'HIRED', label: '✅ Hired', color: 'badge-green' },
];

export default function ViewApplications() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('');

  // Bulk actions
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') {
      navigate('/');
      return;
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const sorted = data.applications.sort((a: Application, b: Application) => b.matchScore - a.matchScore);

        // Auto-update APPLIED to VIEWED (recruiter is viewing them now!)
        const updatedApps = sorted.map((app: Application) => {
          if (app.status === 'APPLIED') {
            // Silently update in background
            updateStatus(app.id, 'VIEWED');
            return { ...app, status: 'VIEWED' };
          }
          return app;
        });

        setApplications(updatedApps);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setApplications(applications.map(app =>
          app.id === appId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedApps.size === 0) return;

    for (const appId of selectedApps) {
      await updateStatus(appId, bulkAction);
    }

    setSelectedApps(new Set());
    setBulkAction('');
    alert(`${selectedApps.size} applications updated to ${bulkAction}!`);
  };

  const toggleSelect = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const selectAll = () => {
    if (selectedApps.size === filteredApps.length) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(filteredApps.map(app => app.id)));
    }
  };

  // ADVANCED FILTERING
  const filteredApps = applications.filter(app => {
    // Status filter
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;

    // Search filter (name or email)
    if (searchTerm && !app.applicant.user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !app.applicant.user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Match score filter
    if (app.matchScore < minMatchScore) return false;

    // Experience filter
    if (experienceFilter !== 'ALL' && app.applicant.experience !== experienceFilter) return false;

    // Skill filter
    if (skillFilter && !app.applicant.skills.some(s =>
      s.toLowerCase().includes(skillFilter.toLowerCase())
    )) {
      return false;
    }

    return true;
  });

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'ALL' || searchTerm !== '' || minMatchScore > 0 ||
    experienceFilter !== 'ALL' || skillFilter !== '';

  return (
    <div className="page-bg min-h-screen">
      <RecruiterHeader />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold gradient-text mb-8">Applications ({applications.length})</h1>

        {/* FILTERS & SEARCH */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold mb-4">🔍 Filter & Search (Handle Hundreds!)</h3>

          <div className="grid grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status ({applications.length})</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({applications.filter(a => a.status === opt.value).length})
                </option>
              ))}
            </select>

            {/* Match Score Filter */}
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Matches</option>
              <option value={70}>70%+ Match (Best)</option>
              <option value={50}>50%+ Match</option>
              <option value={30}>30%+ Match</option>
            </select>

            {/* Experience Filter */}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Experience</option>
              <option value="ENTRY">Entry Level</option>
              <option value="JUNIOR">Junior Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior Level</option>
            </select>

            {/* Skill Filter */}
            <input
              type="text"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredApps.length}</span> of {applications.length} applications
          </p>
        </div>

        {/* BULK ACTIONS */}
        {selectedApps.size > 0 && (
          <div className="card p-4 mb-6 bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="font-bold text-blue-800">
                {selectedApps.size} application{selectedApps.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Action...</option>
                  <option value="SHORTLISTED">⭐ Shortlist All</option>
                  <option value="INTERVIEW">📞 Interview All</option>
                  <option value="REJECTED">❌ Reject All</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="btn-primary disabled:opacity-50"
                >
                  Apply to {selectedApps.size}
                </button>
                <button
                  onClick={() => setSelectedApps(new Set())}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SELECT ALL */}
        {filteredApps.length > 0 && (
          <div className="mb-4">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              {selectedApps.size === filteredApps.length ? '☑️ Deselect All' : '☐ Select All'}
            </button>
          </div>
        )}

        {/* APPLICATIONS LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2">No Applications Match Filters</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className={`card p-6 ${hasActiveFilters ? 'border-2 border-blue-200 bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-6">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedApps.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    className="w-5 h-5 mt-1 cursor-pointer"
                  />

                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {app.applicant.user.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{app.applicant.user.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>📧 {app.applicant.user.email}</span>
                      {app.applicant.user.phone && <span>📞 {app.applicant.user.phone}</span>}
                    </div>

                    {/* Match Score */}
                    <div className="mb-3">
                      <span className={`badge ${app.matchScore >= 70 ? 'badge-green' : app.matchScore >= 50 ? 'badge-blue' : 'badge-purple'} text-lg font-bold`}>
                        🎯 {app.matchScore}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="font-medium">{app.applicant.experience}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Education</p>
                        <p className="font-medium">{app.applicant.education}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {app.applicant.skills.map((skill, idx) => (
                          <span key={idx} className="badge badge-blue">{skill}</span>
                        ))}
                      </div>
                    </div>

                    {app.coverLetter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {app.applicant.resumeUrl ? (
                      <a
                        href={app.applicant.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold text-center text-sm"
                      >
                        📄 View CV
                      </a>
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-center text-sm">
                        No CV
                      </div>
                    )}

                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    <p className="text-xs text-gray-500 text-center">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
