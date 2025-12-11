import apiClient from './api';

export const authService = {
    register: async (data: any) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },
    login: async (data: any) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    saveAuthData: (token: string, user: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    getSavedUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    getSavedToken: () => localStorage.getItem('token'),
};
