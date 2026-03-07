import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps a route and redirects non-admin users to the dashboard.
 * Waits for user profile to load before checking role (prevents race condition).
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Wait for the async profile fetch to complete before deciding
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Role enum is stored as 'ROLE_ADMIN' in Java
    if (user?.role !== 'ROLE_ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
