import React, { useState } from 'react';
import { analyzeJobMatch, JobMatchResult } from '../services/api';

interface JobMatchProps {
    resumeId: number;
    isPro: boolean;
}

export const JobMatch: React.FC<JobMatchProps> = ({ resumeId, isPro }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<JobMatchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            setError('Please enter a job description to analyze.');
            return;
        }

        if (!isPro) {
            setError('Job Match Engine is an ElevateAI Pro feature. Please upgrade to continue.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const matchData = await analyzeJobMatch(resumeId, jobDescription);
            setResult(matchData);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze job match.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-full">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
                </svg>
                Job Match Engine
                {!isPro && (
                    <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Pro</span>
                )}
            </h2>
            <p className="text-slate-500 text-sm mb-6">Instantly score your resume against a specific job description to find missing keywords and gaps.</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Target Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full h-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="text-sm text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                        {error.includes('Pro feature') && (
                            <button onClick={() => window.location.href = '/pricing'} className="ml-auto px-3 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600 transition-colors">Upgrade</button>
                        )}
                    </div>
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={loading || !jobDescription.trim()}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Calculate Match Score
                        </>
                    )}
                </button>

                {/* Match Results */}
                {result && !loading && (
                    <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {/* Circular Score display */}
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Match</h3>
                            <div className="relative flex items-center justify-center w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={351.8}
                                        strokeDashoffset={351.8 - (351.8 * result.matchScore) / 100}
                                        className={`${result.matchScore >= 80 ? 'text-emerald-500' : result.matchScore >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className={`text-3xl font-extrabold ${result.matchScore >= 80 ? 'text-emerald-600' : result.matchScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {result.matchScore}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">/ 100</span>
                                </div>
                            </div>
                        </div>

                        {/* Tailored Advice */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Actionable Advice
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {result.tailoredAdvice}
                            </p>
                        </div>

                        {/* Keywords Columns */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Missing Keywords (Actionable!) */}
                            {result.missingKeywords && result.missingKeywords.length > 0 && (
                                <div className="bg-rose-50/30 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Missing Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords.map(kw => (
                                            <span key={kw} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-lg shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Matching Keywords */}
                            {result.matchingKeywords && result.matchingKeywords.length > 0 && (
                                <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Matched Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.matchingKeywords.map(kw => (
                                            <span key={kw} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
