import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2Callback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Extract the token parameter from the URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // Save the token to context (which saves to localStorage)
            login(token);
            // Redirect to the dashboard
            navigate('/dashboard', { replace: true });
        } else {
            console.error('No token found in the OAuth2 callback URL.');
            setError('Authentication failed. No token received from the server.');
            // Fallback redirect after a few seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    }, [location, navigate, login]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Login Failed</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="w-full bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-700 transition-colors">Return to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-slate-800">Authenticating...</h2>
                <p className="text-slate-500 mt-2">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default OAuth2Callback;
