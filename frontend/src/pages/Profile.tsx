import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
    name: string;
    email: string;
    picture: string;
    provider: string;
    isPro: boolean;
    scansUsed: number;
    resumeCount: number;
}

export const Profile: React.FC = () => {
    const { token, logout } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => { setProfile(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    const FREE_SCAN_LIMIT = 2;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">Please sign in to view your profile.</p>
            </div>
        );
    }

    const scansLeft = Math.max(0, FREE_SCAN_LIMIT - profile.scansUsed);
    const scanPercent = profile.isPro ? 100 : Math.min(100, (profile.scansUsed / FREE_SCAN_LIMIT) * 100);
    const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">

            {/* Back link */}
            <div className="max-w-2xl mx-auto mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Home
                </Link>
            </div>

            <div className="max-w-2xl mx-auto space-y-5">

                {/* ── Hero Identity Card ── */}
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Light mode: clean indigo-to-blue gradient  /  Dark mode: same vibrant gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600" />
                    {/* Bokeh orbs */}
                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-violet-500/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-8 right-0 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-0 right-1/3 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl" />

                    {/* Glass panel content */}
                    <div className="relative z-10 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                            {/* Avatar */}
                            {profile.picture ? (
                                <img src={profile.picture} alt={profile.name}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/20 shadow-2xl object-cover ring-2 ring-white/10 shrink-0" />
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-black shrink-0">
                                    {initials}
                                </div>
                            )}

                            {/* Name & email */}
                            <div className="text-center sm:text-left flex-1 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.name || 'Anonymous'}</h1>
                                <p className="text-indigo-200 text-sm mt-1">{profile.email}</p>

                                {/* Badges */}
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                                    <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${profile.provider === 'linkedin' ? 'bg-blue-500/80' : 'bg-red-500/80'} backdrop-blur-sm`}>
                                        {profile.provider === 'linkedin' ? '🔗 LinkedIn' : '🔴 Google'}
                                    </span>
                                    {profile.isPro ? (
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-amber-500/30 tracking-wider">
                                            ⚡ PRO
                                        </span>
                                    ) : (
                                        <span className="bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 text-xs font-bold px-3 py-1 rounded-full">
                                            FREE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Plan Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Plan</p>
                        {profile.isPro ? (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl">⚡</span>
                                    <span className="text-xl font-black text-amber-500">ElevateAI Pro</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Unlimited scans & all features</p>
                            </>
                        ) : (
                            <>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">Free</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">2 AI scans included</p>
                                <Link to="/pricing" className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
                                    Upgrade to Pro →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Scans Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">AI Scans Used</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {profile.isPro ? '∞' : `${profile.scansUsed} / ${FREE_SCAN_LIMIT}`}
                        </p>
                        {!profile.isPro && (
                            <>
                                {/* Animated progress bar */}
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-700 ${scanPercent >= 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
                                        style={{ width: `${scanPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{scansLeft} scan{scansLeft !== 1 ? 's' : ''} remaining</p>
                            </>
                        )}
                    </div>

                    {/* Resumes Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Resumes Uploaded</p>
                        <div className="flex items-end gap-2 mb-2">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{profile.resumeCount}</p>
                            <span className="text-slate-400 dark:text-slate-400 text-sm mb-0.5">total</span>
                        </div>
                        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
                            View History →
                        </Link>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Quick Actions</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {!profile.isPro && (
                            <Link
                                to="/pricing"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-200 dark:shadow-violet-900/50 transition-all hover:-translate-y-0.5 text-sm"
                            >
                                ⚡ Upgrade to Pro
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Scan Resume
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-all hover:-translate-y-0.5 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* ── Upgrade upsell ── */}
                {!profile.isPro && (
                    <div className="bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">⚡</div>
                            <div className="flex-1">
                                <h3 className="text-slate-900 dark:text-white font-black text-lg mb-1">Unlock ElevateAI Pro</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Get unlimited ATS scans, all premium templates, full keyword analysis, and priority AI responses.</p>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {['Unlimited AI scans', 'Full keyword insights', 'Premium templates', 'Priority support'].map(f => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <Link to="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 text-sm shadow-lg shadow-violet-200 dark:shadow-violet-900/50">
                                    View Plans & Pricing →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
