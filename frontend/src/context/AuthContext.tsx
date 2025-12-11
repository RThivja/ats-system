import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved auth data on mount
        const savedToken = authService.getSavedToken();
        const savedUser = authService.getSavedUser();

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setToken(response.token);
        setUser(response.user);
        authService.saveAuthData(response.token, response.user);
    };

    const register = async (data: any) => {
        const response = await authService.register(data);
        setToken(response.token);
        setUser(response.user);
        authService.saveAuthData(response.token, response.user);
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
