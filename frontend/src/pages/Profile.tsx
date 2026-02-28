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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Please sign in to view your profile.</p>
            </div>
        );
    }

    const scansLeft = Math.max(0, FREE_SCAN_LIMIT - profile.scansUsed);
    const scanPercent = profile.isPro ? 100 : Math.min(100, (profile.scansUsed / FREE_SCAN_LIMIT) * 100);
    const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const providerLabel = profile.provider === 'linkedin' ? 'LinkedIn' : 'Google';
    const providerColor = profile.provider === 'linkedin' ? 'bg-blue-600' : 'bg-red-500';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
                </div>

                {/* Identity Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Banner */}
                    <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                    <div className="px-8 pb-8 -mt-12">
                        <div className="flex items-end gap-5 mb-5">
                            {/* Avatar */}
                            {profile.picture ? (
                                <img src={profile.picture} alt={profile.name} className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-black">
                                    {initials}
                                </div>
                            )}
                            <div className="mb-1">
                                <h2 className="text-2xl font-extrabold text-slate-900">{profile.name || 'Anonymous'}</h2>
                                <p className="text-slate-500 font-medium text-sm">{profile.email}</p>
                            </div>
                            <div className="ml-auto mb-1 flex items-center gap-2">
                                <span className={`${providerColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                                    {providerLabel}
                                </span>
                                {profile.isPro ? (
                                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow shadow-amber-200 tracking-wider">
                                        ⚡ PRO
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                                        FREE
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Plan */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</p>
                        {profile.isPro ? (
                            <>
                                <p className="text-2xl font-black text-amber-500">ElevateAI Pro</p>
                                <p className="text-xs text-slate-500">Unlimited scans & premium templates</p>
                            </>
                        ) : (
                            <>
                                <p className="text-2xl font-black text-slate-700">Free</p>
                                <p className="text-xs text-slate-500">2 AI scans included</p>
                                <Link to="/pricing" className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                    Upgrade to Pro →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* AI Scans */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Scans Used</p>
                        <p className="text-2xl font-black text-slate-900">
                            {profile.isPro ? '∞' : `${profile.scansUsed} / ${FREE_SCAN_LIMIT}`}
                        </p>
                        {!profile.isPro && (
                            <div className="mt-1">
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all ${scanPercent >= 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${scanPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{scansLeft} scan{scansLeft !== 1 ? 's' : ''} remaining</p>
                            </div>
                        )}
                    </div>

                    {/* Resumes */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumes Uploaded</p>
                        <p className="text-2xl font-black text-slate-900">{profile.resumeCount}</p>
                        <Link to="/dashboard" className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            View History →
                        </Link>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Account Actions</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {!profile.isPro && (
                            <Link
                                to="/pricing"
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all text-sm"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                Upgrade to ElevateAI Pro
                            </Link>
                        )}
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Scan a New Resume
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
