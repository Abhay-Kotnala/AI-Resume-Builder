import React, { useState } from 'react';
import { generateCoverLetter } from '../services/api';
import { trackCoverLetterGenerated } from '../services/analytics';

interface Props {
    resumeId: number;
}

export const CoverLetterGenerator: React.FC<Props> = ({ resumeId }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await generateCoverLetter(resumeId, jobDescription);
            setResult(res.coverLetter);
            trackCoverLetterGenerated();
        } catch (err: any) {
            setError(err.message || 'Failed to generate cover letter.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ElevateAI_Cover_Letter.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const wordCount = result ? result.split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white rounded-3xl p-6 border border-blue-100 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Cover Letter</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Tailored to any job in seconds using your resume data</p>
                </div>
            </div>

            {/* Job Description Input */}
            <div className="relative mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Job Description (optional but recommended)</label>
                <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job posting here for a perfectly tailored letter..."
                    className="w-full rounded-2xl border border-blue-200 p-4 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none bg-white shadow-sm text-slate-700 placeholder:text-slate-400 transition-all"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Writing your cover letter…
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {result ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                    </>
                )}
            </button>

            {/* Shimmer Skeleton while loading */}
            {loading && (
                <div className="mt-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-blue-100 rounded-full w-3/4"></div>
                    <div className="h-4 bg-blue-100 rounded-full"></div>
                    <div className="h-4 bg-blue-100 rounded-full w-5/6"></div>
                    <div className="h-4 bg-blue-100 rounded-full w-2/3"></div>
                    <div className="h-4 bg-blue-100 rounded-full"></div>
                    <div className="h-4 bg-blue-100 rounded-full w-4/5"></div>
                </div>
            )}

            {/* Result */}
            {result && !loading && (
                <div className="mt-5 bg-white rounded-2xl border border-blue-100 shadow-inner overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready</span>
                            <span className="text-xs text-slate-400">· {wordCount} words</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                .txt
                            </button>
                        </div>
                    </div>

                    {/* Letter Body */}
                    <div className="px-6 py-5 text-slate-700 whitespace-pre-wrap text-[14.5px] leading-relaxed max-h-[400px] overflow-y-auto">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};
