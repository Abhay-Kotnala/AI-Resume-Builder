import React, { useState } from 'react';
import { AnalysisResponse, exportToPdf } from '../services/api';
import { MagicWandEditor } from './MagicWandEditor';
import { CoverLetterGenerator } from './CoverLetterGenerator';

interface AtsDashboardProps {
    result: AnalysisResponse;
}

export const AtsDashboard: React.FC<AtsDashboardProps> = ({ result }) => {
    const [completedTodos, setCompletedTodos] = useState<Set<number>>(new Set());
    const [editingBullet, setEditingBullet] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

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
        <div className="p-8 space-y-8 animate-fade-in-up">

            {/* Header / Score Section */}
            <div className={`p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-500 relative ${getScoreLightBg(result.atsScore)}`}>
                <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between w-full">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Analysis Complete</h2>
                            <p className="text-slate-600 font-medium mt-2">Here is how your resume performed against our ATS algorithms.</p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    setIsExporting(true);
                                    await exportToPdf(result.resumeId);
                                } catch (error) {
                                    console.error('Failed to export PDF:', error);
                                } finally {
                                    setIsExporting(false);
                                }
                            }}
                            disabled={isExporting}
                            className="bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 text-sm self-center md:self-start print:hidden cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            )}
                            {isExporting ? 'Generating PDF...' : 'Export to PDF'}
                        </button>
                    </div>
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
                            <div className="flex flex-wrap gap-2">
                                {missingKeywordsList.map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-rose-100 text-rose-700 text-sm font-semibold rounded-full border border-rose-200">{kw}</span>
                                ))}
                                {missingKeywordsList.length === 0 && <span className="text-slate-500 text-sm">No missing keywords!</span>}
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
            {improvementsList.length > 0 && (
                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        Actionable Fix-It Checklist
                    </h3>
                    <div className="space-y-3">
                        {improvementsList.map((suggestion, index) => {
                            const isCompleted = completedTodos.has(index);
                            return (
                                <div
                                    key={index}
                                    onClick={() => toggleTodo(index)}
                                    className={`p-4 rounded-xl border flex gap-4 items-start cursor-pointer transition-all duration-300 ${isCompleted ? 'bg-indigo-50/50 border-indigo-100/50 opacity-60' : 'bg-white border-indigo-200 shadow-sm hover:border-indigo-300 hover:shadow-md'}`}
                                >
                                    <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-indigo-200 text-transparent'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <p className={`text-slate-700 leading-relaxed font-medium ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                                        {suggestion}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Cover Letter Generator */}
            <CoverLetterGenerator resumeId={result.resumeId} />

            {/* Magic Wand Modal */}
            {editingBullet && (
                <MagicWandEditor
                    initialText={editingBullet}
                    onClose={() => setEditingBullet(null)}
                />
            )}
        </div>
    );
};
