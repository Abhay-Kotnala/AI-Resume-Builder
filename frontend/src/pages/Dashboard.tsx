import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

import { patchResumeLabel, deleteResume } from '../services/api';

interface ResumeHistoryItem {
    id: number;
    fileName: string;
    label?: string;
    atsScore: number;
    createdAt?: string;
}

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [resumes, setResumes] = useState<ResumeHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingResumeId, setEditingResumeId] = useState<number | null>(null);
    const [editLabelText, setEditLabelText] = useState('');

    const token = localStorage.getItem('elevateAI_token');

    useEffect(() => {
        if (token) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resume/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : [])
                .then(data => setResumes(Array.isArray(data) ? data : []))
                .catch(() => setResumes([]))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const firstName = user?.name?.split(' ')[0] || 'there';

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'bg-amber-50 border-amber-100';
        return 'bg-red-50 border-red-100';
    };

    const handleStartEditing = (resumeId: number, currentLabel: string | undefined, fileName: string) => {
        setEditingResumeId(resumeId);
        setEditLabelText(currentLabel || fileName);
    };

    const handleSaveLabel = async (resumeId: number) => {
        try {
            if (editLabelText.trim()) {
                await patchResumeLabel(resumeId, editLabelText);
                setResumes(prev => prev.map(r => r.id === resumeId ? { ...r, label: editLabelText } : r));
            }
        } catch (err) {
            console.error('Failed to update label', err);
        } finally {
            setEditingResumeId(null);
            setEditLabelText('');
        }
    };

    const handleDelete = async (resumeId: number) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await deleteResume(resumeId);
            setResumes(prev => prev.filter(r => r.id !== resumeId));
        } catch (err) {
            console.error('Failed to delete resume', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:bg-slate-900">
            {/* Navbar */}
            <nav className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                        </Link>
                        <div className="flex items-center gap-4">
                            {user?.picture ? (
                                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-emerald-200 shadow-sm object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                    {firstName?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">{user?.name}</span>
                            <button
                                onClick={logout}
                                className="text-sm px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Welcome Hero Section */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-12 mb-10 shadow-xl">
                    {/* Decorative gradient orbs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-32 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2"></div>

                    <div className="relative flex items-center gap-6">
                        {user?.picture ? (
                            <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-2xl object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-3xl">
                                {firstName?.[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}
                        <div>
                            <p className="text-emerald-400 text-sm font-medium mb-1 tracking-wider uppercase">Welcome back</p>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Hey, {firstName}! 👋</h1>
                            <p className="text-slate-400">Signed in via <span className="text-slate-300 capitalize">{user?.provider}</span> · {user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Resume History Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50">
                                <h2 className="text-lg font-semibold text-slate-800">Resume History</h2>
                                <p className="text-sm text-slate-500 mt-1">Your previously analyzed resumes</p>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-slate-400 mt-3 text-sm">Loading your resumes...</p>
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <h3 className="font-semibold text-slate-700 mb-1">No resumes yet</h3>
                                    <p className="text-slate-400 text-sm mb-6">Upload your first resume on the home page to get started.</p>
                                    <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors text-sm">
                                        Analyse my resume
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {resumes.map((resume) => (
                                        <div key={resume.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors group">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div
                                                    className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                                                    onClick={() => window.location.href = `/builder/${resume.id}`}
                                                >
                                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </div>
                                                <div className="flex-1">
                                                    {editingResumeId === resume.id ? (
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            className="w-full text-sm font-medium text-slate-900 border-b border-emerald-500 focus:outline-none bg-transparent"
                                                            value={editLabelText}
                                                            onChange={e => setEditLabelText(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handleSaveLabel(resume.id)}
                                                            onBlur={() => handleSaveLabel(resume.id)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Link to={`/builder/${resume.id}`} className="font-medium text-slate-700 text-sm hover:text-emerald-600 transition-colors">
                                                                {resume.label || resume.fileName || `Resume #${resume.id}`}
                                                            </Link>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); handleStartEditing(resume.id, resume.label, resume.fileName); }}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-opacity"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-0.5">{resume.createdAt || 'Recently analyzed'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleDelete(resume.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1.5 rounded-md hover:bg-red-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                                <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${getScoreBg(resume.atsScore)}`}>
                                                    <span className={getScoreColor(resume.atsScore)}>{resume.atsScore}% ATS</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link to="/" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors group">
                                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-emerald-800 text-sm">New Analysis</p>
                                        <p className="text-xs text-emerald-600">Upload a resume to analyse</p>
                                    </div>
                                </Link>

                                <Link to="/pricing" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group">
                                    <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">Upgrade Plan</p>
                                        <p className="text-xs text-slate-500">Unlock AI cover letters</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-6 text-white">
                            <p className="text-emerald-100 text-sm font-medium mb-1">Resumes Analysed</p>
                            <p className="text-4xl font-bold mb-1">{resumes.length}</p>
                            <p className="text-emerald-200 text-xs">Keep optimising for better results!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
