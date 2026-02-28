import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
    name: string;
    email: string;
    picture: string;
    provider: string;
}

interface AuthContextType {
    token: string | null;
    user: UserProfile | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    isSignInModalOpen: boolean;
    openSignInModal: () => void;
    closeSignInModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (token: string): Promise<UserProfile | null> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return response.json();
    } catch (e) {
        console.error('Failed to fetch user profile', e);
    }
    return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('elevateAI_token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserProfile(storedToken).then(setUser);
        }
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('elevateAI_token', newToken);
        fetchUserProfile(newToken).then(setUser);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('elevateAI_token');
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token,
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
