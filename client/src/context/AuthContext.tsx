import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import api from '../utils/api';
import type { Address } from '../components/StructuredAddressForm';

interface User {
    _id: string;
    name?: string;
    username: string;
    email?: string;
    phone?: string;
    address?: Address;
    type?: string;
    dueAmount?: number;
    role: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<User>;
    updateUser: (userData: User) => void;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => { throw new Error('Context not initialized'); },
    updateUser: () => { },
    logout: () => { },
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Always fetch fresh profile if token exists to ensure complete data
                if (parsedUser.token && parsedUser.role === 'customer') {
                    try {
                        const { data: profile } = await api.get('/customers/profile');
                        const enrichedUser = { ...parsedUser, ...profile };
                        setUser(enrichedUser);
                        localStorage.setItem('user', JSON.stringify(enrichedUser));
                    } catch (error) {
                        console.error('Failed to auto-fetch profile:', error);
                        // If token is invalid, logout
                        if ((error as any).response?.status === 401) {
                            logout();
                        }
                    }
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username: string, password: string): Promise<User> => {
        const { data } = await api.post('/auth/login', { username, password });

        // After login, if it's a customer, fetch full profile immediately
        let finalUser = data;
        if (data.role === 'customer') {
            try {
                const { data: profile } = await api.get('/customers/profile', {
                    headers: { Authorization: `Bearer ${data.token}` }
                });
                finalUser = { ...data, ...profile };
            } catch (error) {
                console.error('Failed to fetch profile after login:', error);
            }
        }

        setUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));
        return finalUser;
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
