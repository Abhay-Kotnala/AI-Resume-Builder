import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

interface PublicProfileData {
    name: string;
    picture: string;
    bestScore: number;
    isPro: boolean;
    referralCode: string;
}

export const PublicProfile: React.FC = () => {
    const { referralCode } = useParams<{ referralCode: string }>();
    const [profile, setProfile] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/${referralCode}`);
                if (!res.ok) {
                    throw new Error('Profile not found');
                }
                const data = await res.json();
                setProfile(data);
                // Update basic meta tags dynamically
                document.title = `${data.name}'s ElevateAI Profile - ${data.bestScore}% ATS Score`;
            } catch (err: any) {
                setError(err.message || 'Could not load profile');
            } finally {
                setLoading(false);
            }
        };

        if (referralCode) {
            fetchProfile();
        }
    }, [referralCode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h1>
                <p className="text-slate-500 mb-6">This URL might be incorrect or the user doesn't exist.</p>
                <Link to="/" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                    Go to ElevateAI
                </Link>
            </div>
        );
    }

    const { name, picture, bestScore, referralCode: refCode } = profile;
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col items-center justify-center p-4 sm:p-8">
            {/* The Social Card */}
            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                {/* Avatar */}
                <div className="relative mb-6">
                    {picture ? (
                        <img src={picture} alt={name} className="w-28 h-28 rounded-full border-4 border-white/30 shadow-xl object-cover" />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white/30">
                            {initial}
                        </div>
                    )}

                    {/* Floating Badge */}
                    <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-emerald-400/50 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Top Talent
                    </div>
                </div>

                {/* Info */}
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">{name}</h1>
                <p className="text-slate-300 font-medium mb-8">ElevateAI Verified Profile</p>

                {/* Main Stat Matrix */}
                <div className="w-full bg-black/20 rounded-2xl p-6 border border-white/10 flex flex-col items-center mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Highest Resume Score</span>
                    <div className="flex items-baseline gap-1 relative z-10">
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
                            {bestScore || 0}
                        </span>
                        <span className="text-xl font-bold text-emerald-400/80">%</span>
                    </div>
                </div>

                {/* CTA - Use their referral link */}
                <Link to={`/?ref=${refCode}`} className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 font-extrabold rounded-xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    Build Your Resume Like {name.split(' ')[0]}
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
            </div>

            {/* Branding Footer */}
            <div className="mt-12 opacity-50 flex items-center gap-2">
                <span className="text-sm font-medium text-white">Powered by</span>
                <Link to="/">
                    <Logo className="w-6 h-6 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
                </Link>
            </div>
        </div>
    );
};
