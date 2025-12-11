import apiClient from './api';

export const jobService = {
    createJob: async (data: any) => {
        const response = await apiClient.post('/jobs', data);
        return response.data.job;
    },
    getAllJobs: async () => {
        const response = await apiClient.get('/jobs');
        return response.data.jobs;
    },
    getJobById: async (id: string) => {
        const response = await apiClient.get(`/jobs/${id}`);
        return response.data.job;
    },
    deleteJob: async (id: string) => {
        await apiClient.delete(`/jobs/${id}`);
    },
};
