import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MyJobs from './pages/MyJobs';
import CreateJob from './pages/CreateJob';
import ViewApplications from './pages/ViewApplications';
import './index.css';
import './styles/theme.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />

            {/* Applicant */}
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/profile" element={<Profile />} />

            {/* Recruiter */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/applications/:jobId" element={<ViewApplications />} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
