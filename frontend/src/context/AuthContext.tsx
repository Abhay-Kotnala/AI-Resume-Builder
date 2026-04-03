import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
    name: string;
    email: string;
    picture: string;
    provider: string;
    role: string;
    isPro: boolean;
    scansUsed: number;
}

interface AuthContextType {
    token: string | null;
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    isSignInModalOpen: boolean;
    openSignInModal: () => void;
    closeSignInModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (token: string, logoutFn?: () => void): Promise<UserProfile | null> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return response.json();
        if (response.status === 401 && logoutFn) {
            logoutFn();
        }
    } catch (e) {
        console.error('Failed to fetch user profile', e);
    }
    return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('elevateAI_token');
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('elevateAI_token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserProfile(storedToken, logout)
                .then((userData) => {
                    if (userData) {
                        setUser(userData);
                    } else {
                        // If no user data was returned (e.g. 401 expired), clear state so they don't get stuck
                        logout();
                    }
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('elevateAI_token', newToken);
        fetchUserProfile(newToken, logout).then((userData) => {
            if (userData) setUser(userData);
        });
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        isSignInModalOpen,
        openSignInModal: () => setIsSignInModalOpen(true),
        closeSignInModal: () => setIsSignInModalOpen(false)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
