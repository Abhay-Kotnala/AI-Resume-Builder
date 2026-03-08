import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Settings, Award, Layers, Gift, ChevronRight, LogOut, Code, User as UserIcon, Check, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
    name: string;
    email: string;
    picture: string;
    provider: string;
    isPro: boolean;
    scansUsed: number;
    resumeCount: number;
    referralCode?: string;
    referralCount?: number;
    publicProfileViews?: number;
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

    const FREE_SCAN_LIMIT = 4;

    const handleBillingPortal = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stripe/create-portal-session`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error("Failed to access billing portal:", err);
        }
    };

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
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-violet-50/30 dark:bg-none dark:bg-slate-900 py-10 px-4">

            {/* Back link */}
            <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-8 mb-8">
                <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-bold shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </Link>
            </div>

            <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                {/* ── LEFT COLUMN: Profile & Settings ── */}
                <div className="w-full lg:flex-1 space-y-6">

                    {/* ── Hero Identity Card ── */}
                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-200/60 dark:shadow-none border border-indigo-100/80 dark:border-slate-700/60 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/40 dark:bg-slate-800/80 dark:bg-none group">
                        {/* Ambient top glow — more vivid in light mode */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-100/60 dark:from-slate-700/50 to-transparent pointer-events-none" />
                        <div className="absolute -top-10 -left-10 w-56 h-56 bg-violet-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />

                        {/* Glass panel content */}
                        <div className="relative z-10 p-8 sm:p-10">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                                {/* Avatar with glowing ring */}
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300 to-violet-300 dark:from-slate-600 dark:to-slate-700 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                                    {profile.picture ? (
                                        <img src={profile.picture} alt={profile.name}
                                            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl object-cover" />
                                    ) : (
                                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-4xl font-black">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                {/* Name & email */}
                                <div className="text-center sm:text-left flex-1 mb-2">
                                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{profile.name || 'Anonymous'}</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                                        <UserIcon className="w-4 h-4" /> {profile.email}
                                    </p>

                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4">
                                        <span className={`flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl ${profile.provider === 'linkedin' ? 'bg-[#0077b5]/90 border border-[#0077b5]' : 'bg-slate-700 border border-slate-600 dark:bg-slate-600 dark:border-slate-500'} shadow-sm`}>
                                            {profile.provider === 'linkedin' ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                            {profile.provider === 'linkedin' ? 'LinkedIn Auth' : 'Google Auth'}
                                        </span>
                                        {profile.isPro ? (
                                            <span className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 tracking-wide uppercase overflow-hidden">
                                                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                                <Zap className="w-3.5 h-3.5 fill-amber-950" /> PRO MEMBER
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-xs font-bold px-4 py-1.5 rounded-xl uppercase tracking-wide">
                                                FREE TIER
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                        {/* Plan Card */}
                        <div className="group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-md shadow-indigo-100/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 to-violet-500 dark:from-indigo-500 dark:to-violet-600 opacity-80" />
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Plan</p>
                                <Award className="w-5 h-5 text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            {profile.isPro ? (
                                <>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <Zap className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
                                        <span className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">ElevateAI Pro</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Unlimited access
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">Free</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" /> {FREE_SCAN_LIMIT} AI scans total
                                    </p>
                                    <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group/link">
                                        Upgrade to Pro <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Scans Card */}
                        <div className="group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-md shadow-violet-100/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-400 to-indigo-400 dark:from-violet-500 dark:to-indigo-500 opacity-80" />
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Scans Used</p>
                                <Code className="w-5 h-5 text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white mb-3">
                                {profile.isPro ? '∞' : `${profile.scansUsed}`}
                                {!profile.isPro && <span className="text-lg text-slate-400 font-medium"> / {FREE_SCAN_LIMIT}</span>}
                            </p>

                            {!profile.isPro && (
                                <>
                                    {/* Animated progress bar */}
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-3 border border-slate-200 dark:border-slate-700">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${scanPercent >= 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
                                            style={{ width: `${scanPercent}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{scansLeft} scan{scansLeft !== 1 ? 's' : ''} remaining</p>
                                </>
                            )}
                        </div>

                        {/* Resumes Card */}
                        <div className="group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-md shadow-blue-100/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-500 opacity-80" />
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Uploads</p>
                                <Layers className="w-5 h-5 text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="flex items-end gap-2 mb-4 mt-2">
                                <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{profile.resumeCount}</p>
                                <span className="text-slate-500 dark:text-slate-400 font-medium pb-1">total reports</span>
                            </div>
                            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group/link">
                                View History <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Public Views Card */}
                        <div className="group relative bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-md shadow-sky-100/50 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500 dark:from-sky-500 dark:to-blue-600 opacity-80" />
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Profile Views</p>
                                <UserIcon className="w-5 h-5 text-sky-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="flex items-end gap-2 mb-4 mt-2">
                                <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{profile.publicProfileViews || 0}</p>
                                <span className="text-slate-500 dark:text-slate-400 font-medium pb-1">recruiters</span>
                            </div>
                            <Link to={`/p/${profile.referralCode}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors group/link">
                                View Profile <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl p-6 shadow-md shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 dark:from-transparent dark:to-transparent pointer-events-none" />
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Quick Actions</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {!profile.isPro && (
                                <Link
                                    to="/pricing"
                                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-1 text-sm group"
                                >
                                    <Zap className="w-4 h-4 fill-white animate-pulse" /> Upgrade to Pro
                                </Link>
                            )}
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold rounded-xl shadow-sm transition-all hover:-translate-y-1 text-sm group"
                            >
                                <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform duration-300" />
                                New Scan
                            </Link>
                            {profile.isPro && (
                                <button
                                    onClick={handleBillingPortal}
                                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all hover:-translate-y-1 text-sm group"
                                >
                                    <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45" /> Manage Billing
                                </button>
                            )}
                            <Link
                                to={`/p/${profile.referralCode}`}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/50 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 font-bold rounded-xl shadow-sm transition-all hover:-translate-y-1 text-sm group"
                            >
                                <UserIcon className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                Public Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl shadow-sm transition-all hover:-translate-y-1 text-sm group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* ── Upgrade upsell ── */}
                    {!profile.isPro && (
                        <div className="relative bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/80 dark:to-slate-800 border border-indigo-100 dark:border-indigo-500/20 rounded-[2rem] p-8 sm:p-10 overflow-hidden shadow-xl shadow-indigo-100/50 dark:shadow-none group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />
                            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0">
                                    <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-slate-900 dark:text-white font-black text-2xl mb-2 drop-shadow-sm">Unlock ElevateAI Pro</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-xl font-medium leading-relaxed">Turbocharge your job search with unlimited ATS scans, all premium templates, full keyword analysis, and priority AI responses.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-8 inline-grid">
                                        {['Unlimited AI scans', 'Full keyword insights', 'Premium templates', 'Priority support'].map(f => (
                                            <div key={f} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-black rounded-xl transition-all hover:-translate-y-1 shadow-xl sm:w-auto w-full text-sm">
                                            View Plans & Pricing <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: Extra Content ── */}
                <div className="w-full lg:max-w-[500px] shrink-0 lg:sticky lg:top-10 space-y-6">
                    {/* ── Refer a Friend ── */}
                    <div className="relative bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-emerald-500/5 dark:shadow-none overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-all duration-500" />
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-2xl transition-all duration-500 delay-100" />

                        <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left gap-5 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0 border border-white/20 animate-[float_4s_ease-in-out_infinite]">
                                <Gift className="w-8 h-8 text-white drop-shadow-sm" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 drop-shadow-sm">Give a Week, Get a Week</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                    Refer a friend using your unique code. When they sign up, you both get <strong className="text-emerald-700 dark:text-emerald-400 px-1 py-0.5 bg-emerald-200/50 dark:bg-emerald-900/50 rounded-md">7 Days of Pro</strong> completely free!
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-emerald-200/80 dark:border-emerald-800/60 flex flex-col gap-5">
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
                                <div className="text-center sm:text-left">
                                    <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">{profile.referralCount || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Friends Invited</div>
                                </div>
                                <div className="text-center sm:text-right hidden sm:block">
                                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-500">{(profile.referralCount || 0) * 7}</div>
                                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Pro Days Earned</div>
                                </div>
                            </div>

                            <div className="w-full relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={(profile.referralCode && profile.referralCode !== '') ? `${window.location.origin}/?ref=${profile.referralCode}` : 'Generating code...'}
                                    className="w-full pl-10 pr-28 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-emerald-50 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors shadow-sm"
                                />
                                <button
                                    onClick={(e) => {
                                        navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile.referralCode}`);
                                        const btn = e.currentTarget;
                                        const origText = btn.innerHTML;
                                        btn.innerHTML = '<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>Copied</span>';
                                        btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
                                        btn.classList.remove('bg-emerald-100', 'text-emerald-800', 'dark:bg-emerald-900', 'dark:text-emerald-300', 'border-transparent');
                                        setTimeout(() => {
                                            btn.innerHTML = origText;
                                            btn.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600');
                                            btn.classList.add('bg-emerald-100', 'text-emerald-800', 'dark:bg-emerald-900', 'dark:text-emerald-300', 'border-transparent');
                                        }, 2000);
                                    }}
                                    disabled={!profile.referralCode || profile.referralCode === ''}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-100 dark:bg-emerald-900/80 border border-transparent hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] sm:text-xs rounded-lg transition-all flex items-center shadow-sm disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
