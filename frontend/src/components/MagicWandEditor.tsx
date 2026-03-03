import React, { useState } from 'react';
import { enhanceBulletPoint } from '../services/api';

interface MagicWandEditorProps {
    initialText: string;
    keywords?: string[];
    onClose: () => void;
    onApply?: (original: string, enhanced: string) => void;
}

export const MagicWandEditor: React.FC<MagicWandEditorProps> = ({ initialText, onClose, onApply }) => {
    const [bullet, setBullet] = useState(initialText);
    const [targetJob, setTargetJob] = useState('');
    const [tone, setTone] = useState('Quantified');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // React Simple WYSIWYG state handled via contentEditable intrinsic DOM value

    const handleEnhance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await enhanceBulletPoint(bullet, targetJob, tone);
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
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 block">Original Text</label>
                            {/* Rich Text Toolbar — onMouseDown preventDefault keeps focus in the editor */}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false); }} className="p-1 px-2 hover:bg-slate-100 rounded text-slate-700 font-bold font-serif" title="Bold">B</button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false); }} className="p-1 px-2 hover:bg-slate-100 rounded text-slate-700 italic font-serif" title="Italic">I</button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false); }} className="p-1 px-2 hover:bg-slate-100 rounded text-slate-700 underline font-serif" title="Underline">U</button>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false); }} className="p-1 px-2 hover:bg-slate-100 rounded text-slate-700" title="Bullet List">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M8 6h.01M8 12h.01M8 18h.01" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-slate-50 border-2 border-slate-200 focus-within:border-emerald-500 transition-colors">
                            {/* ContentEditable Editor */}
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => setBullet(e.currentTarget.innerHTML)}
                                dangerouslySetInnerHTML={{ __html: initialText }}
                                className="w-full text-sm p-4 bg-transparent outline-none min-h-[120px] max-h-[300px] overflow-y-auto"
                                style={{ caretColor: 'rgb(15 23 42)' }}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-bold text-slate-700 block">Target Job Title (Optional)</label>
                            <input
                                type="text"
                                value={targetJob}
                                onChange={(e) => setTargetJob(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full text-sm border-2 border-slate-200 rounded-xl p-3 focus:ring-0 focus:border-emerald-500 bg-white transition-colors"
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-bold text-slate-700 block">Tone Filter</label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full text-sm border-2 border-slate-200 rounded-xl p-3 focus:ring-0 focus:border-emerald-500 bg-white transition-colors cursor-pointer"
                            >
                                <option value="Quantified">Quantified (Metrics-driven)</option>
                                <option value="Leadership">Leadership & Impact</option>
                                <option value="Concise">Concise & Direct</option>
                            </select>
                        </div>
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

                    <div className="pt-2 flex justify-between items-center gap-3 border-t border-slate-100 mt-6 pt-4">
                        <div className="flex gap-2">
                            {/* Apply manually edited text directly */}
                            {onApply && bullet !== initialText && (
                                <button
                                    onClick={() => {
                                        onApply(initialText, bullet);
                                        onClose();
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Save Edits
                                </button>
                            )}
                            {/* Apply to Preview button - shown when we have an AI result */}
                            {result && onApply && (
                                <button
                                    onClick={() => {
                                        onApply(initialText, result);
                                        onClose();
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm"
                                >
                                    <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    Apply AI Update
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
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
        </div>
    );
};
