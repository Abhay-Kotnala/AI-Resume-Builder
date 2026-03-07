import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchResumeResult, AnalysisResponse } from '../services/api';
import { AtsDashboard } from '../components/AtsDashboard';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const Builder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const firstName = user?.name?.split(' ')[0] || '';

    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadResult = async () => {
            if (!id || isNaN(Number(id)) || Number(id) <= 0) {
                setError('Invalid resume ID');
                setLoading(false);
                return;
            }

            try {
                const analysisResult = await fetchResumeResult(Number(id));
                setResult(analysisResult);
            } catch (err: any) {
                console.error('Failed to load resume:', err);
                setError(err.message || 'Failed to load this resume.');
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Restoring your session...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oops, something went wrong</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">{error}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col" style={{ minHeight: '100vh' }}>
            {/* ── Builder Navbar ────────────────────────────────────────── */}
            <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 sm:px-6 lg:px-8 shrink-0 z-50">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 mr-6">
                    <Logo className="w-10 h-10" />
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1 flex-1">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
                        Dashboard
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 transition-all font-bold"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Check Another Resume
                    </Link>

                    <Link
                        to="/pricing"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        Upgrade to Pro
                    </Link>
                </div>

                {/* Right side: Profile */}
                <div className="flex items-center gap-3 ml-auto">
                    {user?.picture ? (
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-full hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                            <img src={user.picture} alt={firstName} className="w-7 h-7 rounded-full object-cover" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">{firstName}</span>
                        </Link>
                    ) : (
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-full hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                {firstName[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">{firstName}</span>
                        </Link>
                    )}
                    <button
                        onClick={logout}
                        className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            {/* ── ATS Dashboard (full remaining height, no scroll on this wrapper) ── */}
            <div className="flex-1 overflow-hidden">
                <AtsDashboard result={result} />
            </div>
        </div>
    );
};
