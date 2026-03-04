import React, { useState, useRef } from 'react';
import { enhanceBulletPoint } from '../services/api';

interface MagicWandEditorProps {
    initialText: string;
    keywords?: string[];
    onClose: () => void;
    onApply?: (original: string, enhanced: string) => void;
}

const TONES = [
    { value: 'Quantified', label: '📊 Quantified', desc: 'Metrics-driven' },
    { value: 'Leadership', label: '🏆 Leadership', desc: 'Impact & influence' },
    { value: 'Concise', label: '⚡ Concise', desc: 'Short & punchy' },
    { value: 'Technical', label: '🔧 Technical', desc: 'Skills-focused' },
    { value: 'Executive', label: '👔 Executive', desc: 'C-suite level' },
    { value: 'STAR', label: '⭐ STAR Method', desc: 'Situation→Result' },
];

const STAR_TEMPLATE = `Situation: [Brief context — what was the challenge or environment?]
Task: [What was your specific responsibility or goal?]
Action: [What did you do? Use strong action verbs.]
Result: [Quantifiable outcome — what improved, by how much?]`;

export const MagicWandEditor: React.FC<MagicWandEditorProps> = ({ initialText, onClose, onApply }) => {
    const [bullet, setBullet] = useState(initialText);
    const [targetJob, setTargetJob] = useState('');
    const [tone, setTone] = useState('Quantified');
    const [loading, setLoading] = useState(false);
    const [alternatives, setAlternatives] = useState<string[]>([]);
    const [selectedAlt, setSelectedAlt] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([initialText]);
    const [historyIdx, setHistoryIdx] = useState(0);
    const [showStarTemplate, setShowStarTemplate] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const pushHistory = (val: string) => {
        const newHist = [...history.slice(0, historyIdx + 1), val];
        setHistory(newHist);
        setHistoryIdx(newHist.length - 1);
    };

    const undo = () => {
        if (historyIdx > 0) {
            const newIdx = historyIdx - 1;
            setHistoryIdx(newIdx);
            setBullet(history[newIdx]);
            if (editorRef.current) editorRef.current.innerHTML = history[newIdx];
        }
    };

    const handleEnhance = async () => {
        setLoading(true);
        setError(null);
        setAlternatives([]);
        setSelectedAlt(null);

        const promptTone = tone === 'STAR' ? 'STAR method (Situation, Task, Action, Result)' : tone;

        try {
            // Fire 3 parallel requests for alternatives
            const requests = [1, 2, 3].map(() =>
                enhanceBulletPoint(bullet, targetJob, promptTone).then(r => r.enhancedBulletPoint)
            );
            const results = await Promise.all(requests);
            const unique = [...new Set(results)]; // deduplicate exact matches
            setAlternatives(unique);
        } catch (err: any) {
            setError(err.message || 'Failed to enhance bullet point.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyAlternative = (alt: string) => {
        pushHistory(alt);
        setBullet(alt);
        if (editorRef.current) editorRef.current.innerHTML = alt;
        setSelectedAlt(alternatives.indexOf(alt));
    };

    const handleUseStarTemplate = () => {
        const current = editorRef.current;
        if (current) current.innerHTML = STAR_TEMPLATE;
        setBullet(STAR_TEMPLATE);
        pushHistory(STAR_TEMPLATE);
        setShowStarTemplate(false);
    };

    const selectedResult = selectedAlt !== null ? alternatives[selectedAlt] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-b border-emerald-100 dark:border-emerald-800 p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                            <span>✨</span> Magic Wand Rewriter
                        </h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">AI generates 3 alternatives — you pick the best one</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Tone grid */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Enhancement Style</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TONES.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => {
                                        setTone(t.value);
                                        if (t.value === 'STAR') setShowStarTemplate(true);
                                    }}
                                    className={`flex flex-col items-start gap-0.5 p-3 rounded-xl border-2 text-left transition-all ${tone === t.value
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 bg-white dark:bg-slate-700'
                                        }`}
                                >
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.label}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* STAR template hint */}
                    {showStarTemplate && tone === 'STAR' && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm">
                            <p className="font-bold text-amber-800 dark:text-amber-300 mb-2">⭐ Use the STAR template?</p>
                            <p className="text-amber-700 dark:text-amber-400 text-xs mb-3">Replace your current text with a structured STAR template to fill in, or let AI auto-structure it for you.</p>
                            <div className="flex gap-2">
                                <button onClick={handleUseStarTemplate} className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">Use Template</button>
                                <button onClick={() => setShowStarTemplate(false)} className="px-3 py-1.5 text-xs font-bold border border-amber-300 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition-colors">Skip — Let AI Do It</button>
                            </div>
                        </div>
                    )}

                    {/* Editor */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Original Text</label>
                            <div className="flex items-center gap-2">
                                {/* Undo */}
                                <button
                                    onClick={undo}
                                    disabled={historyIdx === 0}
                                    title="Undo"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                </button>
                                {/* Rich text toolbar */}
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1 shadow-sm">
                                    <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('bold'); }} className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200 font-bold font-serif" title="Bold">B</button>
                                    <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('italic'); }} className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200 italic font-serif" title="Italic">I</button>
                                    <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('underline'); }} className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200 underline font-serif" title="Underline">U</button>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus-within:border-emerald-500 transition-colors">
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={e => setBullet(e.currentTarget.innerHTML)}
                                dangerouslySetInnerHTML={{ __html: bullet }}
                                className="w-full text-sm p-4 bg-transparent outline-none min-h-[100px] max-h-[200px] overflow-y-auto text-slate-800 dark:text-slate-100"
                                style={{ caretColor: 'currentColor' }}
                                spellCheck={false}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400">{history.length > 1 ? `${historyIdx} edit${historyIdx !== 1 ? 's' : ''} in history` : 'No edits yet'}</p>
                    </div>

                    {/* Target job */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Target Job Title <span className="font-normal text-slate-400">(optional)</span></label>
                        <input
                            type="text"
                            value={targetJob}
                            onChange={e => setTargetJob(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 focus:ring-0 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 p-3 rounded-xl text-sm font-semibold text-center border border-rose-100 dark:border-rose-800">{error}</div>
                    )}

                    {/* Alternatives grid */}
                    {alternatives.length > 0 && (
                        <div className="space-y-3 animate-fade-in-up">
                            <label className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                {alternatives.length} AI Alternatives — click to select
                            </label>
                            {alternatives.map((alt, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleApplyAlternative(alt)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all text-sm leading-relaxed ${selectedAlt === idx
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                        }`}
                                >
                                    <span className="absolute top-2 right-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">#{idx + 1}</span>
                                    {alt}
                                    {selectedAlt === idx && (
                                        <span className="absolute bottom-2 right-2 text-emerald-500">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer actions */}
                    <div className="pt-2 flex justify-between items-center gap-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex gap-2">
                            {/* Save manual edits */}
                            {onApply && bullet !== initialText && alternatives.length === 0 && (
                                <button
                                    onClick={() => { onApply(initialText, bullet); onClose(); }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm flex items-center gap-2 transition-all text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Save Edits
                                </button>
                            )}
                            {/* Apply selected alternative */}
                            {selectedResult && onApply && (
                                <button
                                    onClick={() => { onApply(initialText, selectedResult); onClose(); }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm"
                                >
                                    <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    Apply Selection #{(selectedAlt ?? 0) + 1}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                                Close
                            </button>
                            <button
                                onClick={handleEnhance}
                                disabled={loading || !bullet.trim()}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Generating 3…
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" /></svg>
                                        {alternatives.length > 0 ? 'Regenerate' : 'Generate 3 Rewrites'}
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
