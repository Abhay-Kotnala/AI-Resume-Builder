import React, { useState } from 'react';
import { enhanceBulletPoint } from '../services/api';

interface MagicWandEditorProps {
    initialText: string;
    onClose: () => void;
}

export const MagicWandEditor: React.FC<MagicWandEditorProps> = ({ initialText, onClose }) => {
    const [bullet, setBullet] = useState(initialText);
    const [targetJob, setTargetJob] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEnhance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await enhanceBulletPoint(bullet, targetJob);
            setResult(res.enhancedBulletPoint);
        } catch (err: any) {
            setError(err.message || 'Failed to enhance bullet point.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
                <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-800">
                        <span>✨</span> Magic Wand Rewriter
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Original Point</label>
                        <textarea
                            value={bullet}
                            onChange={(e) => setBullet(e.target.value)}
                            className="w-full text-sm border-2 border-slate-200 rounded-xl p-4 focus:ring-0 focus:border-emerald-500 bg-slate-50 transition-colors resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Target Job Title (Optional)</label>
                        <input
                            type="text"
                            value={targetJob}
                            onChange={(e) => setTargetJob(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full text-sm border-2 border-slate-200 rounded-xl p-3 focus:ring-0 focus:border-emerald-500 bg-white transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-semibold text-center border border-rose-100">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-2 animate-fade-in-up">
                            <label className="text-sm font-bold text-indigo-700 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                AI Enhanced Version
                            </label>
                            <div className="w-full text-slate-800 text-sm border-2 border-indigo-200 bg-indigo-50/50 rounded-xl p-4 leading-relaxed font-medium relative pr-12">
                                {result}
                                <button
                                    onClick={() => navigator.clipboard.writeText(result)}
                                    className="absolute top-2 right-2 p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            Close
                        </button>
                        <button
                            onClick={handleEnhance}
                            disabled={loading || !bullet.trim()}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    Rewrite Selection
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
