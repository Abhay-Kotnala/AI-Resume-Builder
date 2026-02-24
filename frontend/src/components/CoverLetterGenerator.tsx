import React, { useState } from 'react';
import { generateCoverLetter } from '../services/api';

interface Props {
    resumeId: number;
}

export const CoverLetterGenerator: React.FC<Props> = ({ resumeId }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await generateCoverLetter(resumeId, jobDescription);
            setResult(res.coverLetter);
        } catch (err: any) {
            setError(err.message || 'Failed to generate cover letter.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-blue-50/50 rounded-3xl p-8 border border-blue-100 shadow-sm transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-blue-900 mb-1">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Cover Letter Generator
                    </h3>
                    <p className="text-sm font-medium text-blue-700">Write a targeted cover letter instantly using your resume data.</p>
                </div>
            </div>

            <div className="space-y-4">
                <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description here..."
                    className="w-full rounded-2xl border border-blue-200 p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
                />

                {error && <div className="text-sm text-rose-600 font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</div>}

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Writing Cover Letter...' : 'Generate New Cover Letter'}
                    </button>
                </div>

                {result && (
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-inner mt-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Final Output</span>
                            <button onClick={() => navigator.clipboard.writeText(result)} className="text-blue-500 hover:text-blue-700 text-sm font-bold flex gap-1 items-center px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                Copy Text
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                        <div className="text-slate-700 whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
