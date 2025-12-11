import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterHeader from '../components/RecruiterHeader';
import '../styles/theme.css';
import apiClient from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  jobType?: string;
  salary?: string;
  requiredSkills: string[];
  _count: {
    applications: number;
  };
  createdAt: string;
}

export default function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') {
      navigate('/');
      return;
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiClient.get('/jobs/my/jobs');
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = (id: string) => {
    setJobToDelete(id);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      await apiClient.delete(`/jobs/${jobToDelete}`);
      setJobs(jobs.filter(j => j.id !== jobToDelete));
      setJobToDelete(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  return (
    <div className="page-bg min-h-screen">
      <RecruiterHeader />

      <ConfirmModal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job posting? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold gradient-text mb-8">My Job Postings</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold mb-2">No Jobs Posted Yet</h3>
            <p className="text-gray-600 mb-6">Create your first job posting!</p>
            <button onClick={() => navigate('/create-job')} className="btn-primary">
              ➕ Post a Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                    <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm mb-3">
                      {job.location && <span className="text-gray-600">📍 {job.location}</span>}
                      {job.jobType && <span className="text-gray-600">💼 {job.jobType}</span>}
                      {job.salary && <span className="text-green-600 font-semibold">💰 {job.salary}</span>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="badge badge-blue">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{job._count.applications}</p>
                      <p className="text-xs text-gray-600">Applications</p>
                    </div>
                    <button
                      onClick={() => navigate(`/applications/${job.id}`)}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      View Applications
                    </button>
                    <button
                      onClick={() => handleDeleteClick(job.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold text-sm"
                    >
                      Delete
                    </button>
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
