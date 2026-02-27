import React, { useState, useEffect } from 'react';
import { AnalysisResponse, exportToPdf } from '../services/api';
import { MagicWandEditor } from './MagicWandEditor';
import { CoverLetterGenerator } from './CoverLetterGenerator';

interface AtsDashboardProps {
    result: AnalysisResponse;
}

export const AtsDashboard: React.FC<AtsDashboardProps> = ({ result }) => {
    const [completedTodos, setCompletedTodos] = useState<Set<number>>(new Set());
    const [editingBullet, setEditingBullet] = useState<string | null>(null);

    // Export Settings State
    const [exportTemplate, setExportTemplate] = useState('basic');
    const [exportFont, setExportFont] = useState('Helvetica');
    const [isExporting, setIsExporting] = useState(false);

    // Applied bullet point edits { original → enhanced }
    const [appliedEdits, setAppliedEdits] = useState<Array<{ original: string; enhanced: string }>>([]);
    // The fetched+patched HTML that powers the iframe srcdoc
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Callback fired by MagicWandEditor when user clicks 'Apply to Preview'
    const handleApplyEdit = (original: string, enhanced: string) => {
        setAppliedEdits(prev => {
            // Replace existing edit for the same original text, or append
            const next = prev.filter(e => e.original !== original);
            return [...next, { original, enhanced }];
        });
    };

    // Fetch preview HTML from backend whenever template / font / applied edits change
    useEffect(() => {
        if (!result.resumeId || result.resumeId <= 0) return;
        setPreviewLoading(true);
        const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';
        fetch(`${apiBase}/api/resume/${result.resumeId}/preview-html?template=${exportTemplate}&font=${encodeURIComponent(exportFont)}`)
            .then(res => res.text())
            .then(html => {
                // Apply each bullet replacement (simple string substitution)
                let patched = html;
                appliedEdits.forEach(({ original, enhanced }) => {
                    // Escape original for regex use
                    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    patched = patched.replace(new RegExp(escaped, 'g'), enhanced);
                });
                setPreviewHtml(patched);
            })
            .catch(() => setPreviewHtml(null))
            .finally(() => setPreviewLoading(false));
    }, [result.resumeId, exportTemplate, exportFont, appliedEdits]);

    const toggleTodo = (index: number) => {
        setCompletedTodos(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreLightBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'bg-amber-50 border-amber-100';
        return 'bg-rose-50 border-rose-100';
    };

    // Helper to safely split backend string response into an array
    const splitStringToArray = (text: string | null | undefined, delimiter = '\n'): string[] => {
        if (!text) return [];
        return text.split(new RegExp(`[${delimiter}]`)).filter(item => item.trim().length > 0).map(item => item.replace(/^- /, '').trim());
    };

    const strengthsList = splitStringToArray(result.strengths);
    const weaknessesList = splitStringToArray(result.weaknesses);
    const improvementsList = splitStringToArray(result.suggestedImprovements);
    const foundKeywordsList = splitStringToArray(result.foundKeywords, ',');
    const missingKeywordsList = splitStringToArray(result.missingKeywords, ',');

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
            {/* Left Sidebar - Analysis & Tools */}
            <div className="w-full lg:w-1/2 xl:w-5/12 p-6 lg:p-8 space-y-8 overflow-y-auto border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 animate-fade-in-left">
                {/* Header / Score Section */}
                <div className={`p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-500 relative ${getScoreLightBg(result.atsScore)}`}>
                    <div className="space-y-4 text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between w-full">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Analysis Complete</h2>
                                <p className="text-slate-600 font-medium mt-2">Here is how your resume performed against our ATS algorithms.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                    className="md:hidden bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all flex-1"
                                >
                                    View PDF
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setIsExporting(true);
                                            await exportToPdf(result.resumeId, {
                                                text: '', // Using the existing backend text
                                                template: exportTemplate,
                                                font: exportFont
                                            });
                                        } catch (error) {
                                            console.error('Failed to export PDF:', error);
                                        } finally {
                                            setIsExporting(false);
                                        }
                                    }}
                                    disabled={isExporting}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-sm flex-1 print:hidden cursor-pointer active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download
                                </button>
                            </div>

                            <div className="relative flex items-center justify-center shrink-0">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200" />
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * result.atsScore) / 100} className={`${getScoreColor(result.atsScore)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-extrabold tracking-tighter ${getScoreColor(result.atsScore)}`}>{result.atsScore}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
                                </div>
                            </div>
                        </div>

                        {/* Granular Score Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Impact Metrics', score: result.impactScore, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                                { label: 'Brevity & Scanability', score: result.brevityScore, icon: 'M4 6h16M4 12h16m-7 6h7', color: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100' },
                                { label: 'Action Verbs', score: result.actionVerbScore, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' }
                            ].map((item, idx) => (
                                <div key={idx} className={`${item.bg} ${item.border} rounded-2xl p-5 border shadow-sm`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`font-bold flex items-center gap-2 ${item.text}`}>
                                            <svg className="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                                            {item.label}
                                        </span>
                                        <span className={`font-extrabold ${item.text}`}>{item.score}/100</span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-2.5 overflow-hidden">
                                        <div className={`${item.color} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.score}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Executive Summary
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                </div>

                {/* Keywords Section */}
                {(foundKeywordsList.length > 0 || missingKeywordsList.length > 0) && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                            Keyword Matcher
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wider">Found Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {foundKeywordsList.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-200">{kw}</span>
                                    ))}
                                    {foundKeywordsList.length === 0 && <span className="text-slate-500 text-sm">No keywords found.</span>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-700 mb-3 uppercase tracking-wider">Missing Keywords</h4>
                                <div className="relative">
                                    <div className={`flex flex-wrap gap-2 ${result.isPartialAnalysis ? 'blur-[4px] select-none opacity-60' : ''}`}>
                                        {missingKeywordsList.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 bg-rose-100 text-rose-700 text-sm font-semibold rounded-full border border-rose-200">{kw}</span>
                                        ))}
                                        {missingKeywordsList.length === 0 && <span className="text-slate-500 text-sm">No missing keywords!</span>}
                                    </div>
                                    {result.isPartialAnalysis && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40">
                                            <button onClick={() => window.location.href = '/pricing'} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-full shadow-lg hover:bg-emerald-500 hover:shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer">
                                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                Upgrade to Reveal
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Strengths and Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Key Strengths
                        </h3>
                        <ul className="space-y-3">
                            {strengthsList.map((strength, index) => (
                                <li key={index} className="flex gap-3 text-emerald-700">
                                    <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
                                    <span className="leading-relaxed">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {weaknessesList.map((weakness, index) => (
                                <li key={index} className="flex gap-3 text-rose-700 items-start group relative">
                                    <span className="text-rose-400 mt-1 flex-shrink-0">•</span>
                                    <span className="leading-relaxed flex-1 pr-8">{weakness}</span>
                                    <button
                                        onClick={() => setEditingBullet(weakness)}
                                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-rose-100/80 text-rose-600 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg shadow-sm"
                                        title="Rewrite with Magic Wand"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Interactive Fix-It Checklist */}
                {
                    improvementsList.length > 0 && (
                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                Actionable Fix-It Checklist
                            </h3>
                            <div className="space-y-3 relative">
                                <div className={result.isPartialAnalysis ? 'opacity-80' : ''}>
                                    {improvementsList.map((suggestion, index) => {
                                        const isCompleted = completedTodos.has(index);
                                        const isLocked = result.isPartialAnalysis && suggestion.includes('[Locked]');

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => !isLocked && toggleTodo(index)}
                                                className={`p-4 rounded-xl border flex gap-4 items-start transition-all duration-300 mb-3 
                                            ${isLocked ? 'bg-slate-50 border-slate-200 blur-[2px] select-none' :
                                                        isCompleted ? 'bg-indigo-50/50 border-indigo-100/50 opacity-60' :
                                                            'bg-white border-indigo-200 shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer'}`}
                                            >
                                                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-indigo-200 text-transparent'}`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <p className={`text-slate-700 leading-relaxed font-medium ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                                                    {suggestion.replace('- [Locked] ', '')}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                {result.isPartialAnalysis && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 mt-12">
                                        <button onClick={() => window.location.href = '/pricing'} className="px-6 py-3 bg-slate-900 border border-slate-700 text-white text-md font-bold rounded-full shadow-2xl hover:bg-emerald-500 hover:border-emerald-400 hover:shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer transform hover:scale-105 duration-300">
                                            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                            Unlock Premium Insights
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Cover Letter Generator */}
                <CoverLetterGenerator resumeId={result.resumeId} />

                {/* Magic Wand Modal */}
                {
                    editingBullet && (
                        <MagicWandEditor
                            initialText={editingBullet}
                            onClose={() => setEditingBullet(null)}
                            onApply={handleApplyEdit}
                        />
                    )
                }
            </div>
            {/* End of Left Sidebar */}

            {/* Right Panel - Template Selection & Live Preview */}
            <div className="w-full lg:w-1/2 xl:w-7/12 bg-slate-100 p-6 lg:p-8 flex flex-col h-auto lg:h-screen sticky top-0">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                        Select a Template
                    </h3>

                    {/* Inline Template Selection */}
                    <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                        {[
                            { id: 'basic', label: 'Classic' },
                            { id: 'modern', label: 'Modern (Pro)' },
                            { id: 'executive', label: 'Executive (Pro)' }
                        ].map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => {
                                    if (result.isPartialAnalysis && tpl.id !== 'basic') {
                                        if (window.confirm("Premium templates require ElevateAI Pro. Upgrade now?")) {
                                            window.location.href = '/pricing';
                                        }
                                    } else {
                                        setExportTemplate(tpl.id);
                                    }
                                }}
                                className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all ${exportTemplate === tpl.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {tpl.label}
                                {(result.isPartialAnalysis && tpl.id !== 'basic') && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Selector */}
                <div className="mb-6 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-bold text-slate-700">Typography</span>
                    <select
                        value={exportFont}
                        onChange={(e) => setExportFont(e.target.value)}
                        className="bg-slate-50 border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none"
                    >
                        <option value="Helvetica Neue, Helvetica, Arial, sans-serif">Helvetica / Arial</option>
                        <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                        <option value="Georgia, Times New Roman, serif">Georgia / Times</option>
                        <option value="Garamond, serif">Garamond</option>
                    </select>
                </div>

                {/* Live A4 Preview Container */}
                <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative group min-h-[60vh] lg:min-h-0">
                    {/* Applied edits badge */}
                    {appliedEdits.length > 0 && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-indigo-200">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {appliedEdits.length} AI edit{appliedEdits.length !== 1 ? 's' : ''} applied
                        </div>
                    )}
                    {/* Loading overlay while fetching updated HTML */}
                    {previewLoading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                                <span className="text-sm font-medium text-slate-500">Updating preview…</span>
                            </div>
                        </div>
                    )}
                    {result.resumeId && result.resumeId > 0 ? (
                        previewHtml ? (
                            <iframe
                                key={`${exportTemplate}-${exportFont}-${appliedEdits.length}`}
                                className="w-full h-full border-none bg-white min-h-[500px]"
                                srcDoc={previewHtml}
                                title="Live Resume Preview"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400 p-8 min-h-[500px]">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                                <p className="text-sm font-medium">Loading preview…</p>
                            </div>
                        )
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400 p-8 min-h-[500px]">
                            <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <div className="text-center">
                                <p className="font-bold text-slate-600 text-lg">Preview Your Resume</p>
                                <p className="text-sm mt-1">Upload your resume to see a live template preview here</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
