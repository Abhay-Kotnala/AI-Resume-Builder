import React, { useState } from 'react';
import { AnalysisResponse, exportToPdf, exportToDocx, ParsedResumeDTO } from '../services/api';
import { MagicWandEditor } from './MagicWandEditor';
import { CoverLetterGenerator } from './CoverLetterGenerator';
import { InterviewCoach } from './InterviewCoach';
import { trackPdfExported, trackAiRewriteUsed, trackUpgradeClicked } from '../services/analytics';
import { BuilderSidebar, BuilderTab } from './BuilderSidebar';
import { JobTailor } from './JobTailor';
import { LinkedInImport } from './LinkedInImport';
import { GrammarChecker } from './GrammarChecker';
import { ResumeCanvas } from './ResumeCanvas';
// 


interface AtsDashboardProps {
    result: AnalysisResponse;
}

export const AtsDashboard: React.FC<AtsDashboardProps> = ({ result }) => {
    const [tailoredResume, setTailoredResume] = useState<ParsedResumeDTO | null>(null);
    const [editingBullet, setEditingBullet] = useState<string | null>(null);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<BuilderTab>('ats');

    // Export Settings State
    const [exportTemplate, setExportTemplate] = useState('basic');
    const [exportFont, setExportFont] = useState('Helvetica');
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    // Section Ordering & Additions (Phase 4)
    const [sectionOrder, setSectionOrder] = useState<string[]>([
        'Summary', 'Experience', 'Education', 'Skills'
    ]);
    const availableSections = ['Projects', 'Languages', 'Certifications', 'Awards', 'Publications', 'Volunteering', 'Custom'];

    // Applied bullet point edits { original → enhanced }
    const [appliedEdits, setAppliedEdits] = useState<Array<{ original: string; enhanced: string }>>([]);

    // Premium Phase 2 Feature: Heatmap Toggle
    const [showHeatmap, setShowHeatmap] = useState(true);


    // Callback fired by MagicWandEditor when user clicks 'Apply to Preview'
    const handleApplyEdit = (original: string, enhanced: string) => {
        setAppliedEdits(prev => {
            // Replace existing edit for the same original text, or append
            const next = prev.filter(e => e.original !== original);
            return [...next, { original, enhanced }];
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
    const foundKeywordsList = splitStringToArray(result.foundKeywords, ',');
    const missingKeywordsList = splitStringToArray(result.missingKeywords, ',');

    // --- Context Pane Renderers ---

    const renderAtsCheckPane = () => (
        <div className="p-4 sm:p-6 space-y-6">
            <div className={`p-4 rounded-3xl border transition-colors duration-500 ${getScoreLightBg(result.atsScore)}`}>
                <div className="mb-4">
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">ATS Analysis</h2>
                    <p className="text-slate-600 font-medium mt-1 text-xs">How your resume scored against algorithms.</p>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * result.atsScore) / 100} className={`${getScoreColor(result.atsScore)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className={`text-2xl font-extrabold tracking-tighter ${getScoreColor(result.atsScore)}`}>{result.atsScore}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {[
                            { label: 'Impact', score: result.impactScore, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                            { label: 'Formatting', score: result.formattingScore, color: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100' },
                            { label: 'Keywords', score: result.keywordsScore, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' }
                        ].map((item, idx) => (
                            <div key={idx} className={`${item.bg} ${item.border} rounded-xl p-2 border shadow-sm text-center`}>
                                <div className={`text-lg font-extrabold ${item.text}`}>{item.score}</div>
                                <div className={`text-[10px] font-bold ${item.text} opacity-80 mt-0.5`}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-4">
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Strengths
                    </h3>
                    <ul className="space-y-2">
                        {strengthsList.map((strength, index) => (
                            <li key={index} className="flex gap-2 text-emerald-700 text-xs">
                                <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                                <span className="leading-relaxed">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 shadow-sm">
                    <h3 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Weaknesses
                    </h3>
                    <ul className="space-y-2">
                        {weaknessesList.map((weakness, index) => (
                            <li key={index} className="flex gap-2 text-rose-700 items-start group text-xs">
                                <span className="text-rose-400 mt-0.5 flex-shrink-0">•</span>
                                <div className="flex-1 pb-2">
                                    <span className="leading-relaxed">{weakness}</span>
                                    <div className="mt-1.5 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => { trackAiRewriteUsed(); setEditingBullet(weakness); }}
                                            className="text-[10px] uppercase font-extrabold inline-flex items-center gap-1.5 px-2 py-1 bg-white text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200"
                                        >
                                            ✨ Fix
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Keyword Matcher */}
            {(foundKeywordsList.length > 0 || missingKeywordsList.length > 0) && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {foundKeywordsList.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded border border-emerald-200">{kw}</span>
                        ))}
                    </div>
                    {missingKeywordsList.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold text-rose-700 mb-2 uppercase">Missing</h4>
                            <div className="flex flex-wrap gap-1.5 relative">
                                <div className={`flex flex-wrap gap-1.5 ${result.isPartialAnalysis ? 'blur-[3px] select-none opacity-60' : ''}`}>
                                    {missingKeywordsList.map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-semibold rounded border border-rose-200">{kw}</span>
                                    ))}
                                </div>
                                {result.isPartialAnalysis && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 w-full">
                                        <button onClick={() => window.location.href = '/pricing'} className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow-lg">
                                            Upgrade
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderTemplatesPane = () => (
        <div className="p-4 sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6">Templates</h2>
            <div className="flex flex-col gap-4">
                {[
                    { id: 'basic', label: 'Classic Layout', img: '/templates/classic.png' },
                    { id: 'modern', label: 'Modern Accent', img: '/templates/modern.png', pro: true },
                    { id: 'executive', label: 'Executive Split', img: '/templates/executive.png', pro: true },
                    { id: 'tech-focused', label: 'Tech Dense', img: '/templates/tech-focused.png', pro: true },
                    { id: 'minimalist', label: 'Minimalist', img: '/templates/minimalist.png', pro: true },
                    { id: 'bold-bw', label: 'Bold Black & White', img: '/templates/bold-bw.png', pro: true },
                    { id: 'editorial', label: 'Editorial Green', img: '/templates/editorial.png', pro: true },
                    { id: 'olive-sidebar', label: 'Olive Sidebar', img: '/templates/olive-sidebar.png', pro: true },
                    { id: 'orange-bold', label: 'Orange Bold', img: '/templates/orange-bold.png', pro: true },
                    { id: 'blue-pro', label: 'Blue Professional', img: '/templates/blue-pro.png', pro: true }
                ].map(tpl => {
                    const isSelected = exportTemplate === tpl.id;
                    const isLocked = result.isPartialAnalysis && (tpl as any).pro;

                    return (
                        <button
                            key={tpl.id}
                            onClick={() => setExportTemplate(tpl.id)}
                            className={`flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all duration-200 group text-left relative overflow-hidden
                                ${isSelected ? 'border-indigo-500 bg-indigo-50/30 shadow-indigo-100/50 shadow-lg' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                        >
                            <div className="w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                                <img src={tpl.img} alt={tpl.label} className="w-full h-full object-cover object-top" />
                                {isLocked && (
                                    <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                            Pro
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>{tpl.label}</h3>
                                {isSelected && !isLocked && <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1">Currently Active</p>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderDesignPane = () => (
        <div className="p-4 sm:p-6 space-y-8">
            <div>
                <h2 className="text-xl font-extrabold text-slate-800 mb-6">Design & Font</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Document Font</label>
                        <select
                            value={exportFont}
                            onChange={(e) => setExportFont(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 p-3 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
                        >
                            <option value="Helvetica Neue, Helvetica, Arial, sans-serif">Helvetica</option>
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Georgia, Times New Roman, serif">Georgia</option>
                            <option value="Garamond, serif">Garamond</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                    Helpers
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Pro Check</span>
                </h3>
                <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-slate-700">ATS Heatmap Overlay</p>
                        <p className="text-xs text-slate-500 mt-1">Highlights weak phrases on canvas</p>
                    </div>
                    <div className="relative inline-flex items-center">
                        <input type="checkbox" className="sr-only peer" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                </label>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
                <CoverLetterGenerator resumeId={result.resumeId} />
                <InterviewCoach resumeId={result.resumeId} />
            </div>
        </div>
    );

    const renderAddSectionPane = () => (
        <div className="p-4 sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Content
            </h2>
            <p className="text-slate-500 text-sm mb-6">Click to inject a new section into your resume.</p>
            <div className="space-y-3">
                {availableSections.map(secTitle => {
                    const isAdded = sectionOrder.includes(secTitle);
                    return (
                        <button
                            key={secTitle}
                            disabled={isAdded}
                            onClick={() => setSectionOrder(prev => [...prev, secTitle])}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all font-bold text-left
                                ${isAdded
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-60 cursor-not-allowed'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-700 text-slate-700 shadow-sm hover:shadow'}`}
                        >
                            <span>{secTitle}</span>
                            {isAdded ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        setSectionOrder(prev => {
            const arr = [...prev];
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
            return arr;
        });
    };

    const handleMoveDown = (index: number) => {
        if (index === sectionOrder.length - 1) return;
        setSectionOrder(prev => {
            const arr = [...prev];
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
            return arr;
        });
    };

    const handleRemove = (secTitle: string) => {
        setSectionOrder(prev => prev.filter(s => s !== secTitle));
    };

    const renderRearrangePane = () => (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-full">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                Rearrange Layout
            </h2>
            <p className="text-slate-500 text-sm mb-6">Reorder how sections appear on your final PDF.</p>

            <div className="space-y-3">
                {sectionOrder.map((sec, index) => (
                    <div key={sec} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200 group relative">
                        {/* Drag Handle Mock */}
                        <div className="cursor-grab text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM16 6a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 11-4 0 2 2 0 014 0zM16 18a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="font-bold text-slate-700 flex-1">{sec}</span>

                        <div className="flex flex-col gap-1 hidden group-hover:flex absolute right-12">
                            <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button onClick={() => handleMoveDown(index)} disabled={index === sectionOrder.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>

                        <button onClick={() => handleRemove(sec)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors ml-auto z-10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            {sectionOrder.length === 0 && (
                <div className="text-center text-slate-400 mt-8 font-medium">No sections added yet.<br />Go to Add Section!</div>
            )}
        </div>
    );

    const renderDownloadPane = () => {
        const selectedTplConfig = [
            { id: 'basic', label: 'Classic' },
            { id: 'modern', label: 'Modern', pro: true },
            { id: 'executive', label: 'Executive', pro: true },
            { id: 'tech-focused', label: 'Tech Dense', pro: true },
            { id: 'minimalist', label: 'Minimalist', pro: true },
            { id: 'bold-bw', label: 'Bold B&W', pro: true },
            { id: 'editorial', label: 'Editorial', pro: true },
            { id: 'olive-sidebar', label: 'Olive Sidebar', pro: true },
            { id: 'orange-bold', label: 'Orange Bold', pro: true },
            { id: 'blue-pro', label: 'Blue Pro', pro: true }
        ].find(t => t.id === exportTemplate);

        const isCurrentlyLocked = result.isPartialAnalysis && (selectedTplConfig as any)?.pro;

        return (
            <div className="p-4 sm:p-6 flex flex-col h-full items-center justify-center text-center">
                <div className="bg-slate-50 rounded-full p-6 mb-6">
                    <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Export Your PDF</h2>
                <p className="text-slate-500 text-sm mb-8">Download the compiled, ATS-optimized version of your masterpiece.</p>

                <button
                    onClick={async () => {
                        if (isCurrentlyLocked) {
                            trackUpgradeClicked('export_premium_template');
                            window.location.href = '/pricing';
                            return;
                        }
                        try {
                            setIsExporting(true);
                            trackPdfExported(exportTemplate, exportFont);
                            await exportToPdf(result.resumeId, {
                                text: '',
                                template: exportTemplate,
                                font: exportFont,
                                appliedEdits: appliedEdits,
                                sectionOrder: sectionOrder
                            });
                        } catch (error) {
                            console.error('Failed to export PDF:', error);
                        } finally {
                            setIsExporting(false);
                        }
                    }}
                    disabled={isExporting}
                    className={`w-full py-4 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-3 text-lg shadow-xl hover:-translate-y-1 active:translate-y-0
                        ${isCurrentlyLocked
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                        }`}
                >
                    {isExporting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isCurrentlyLocked ? (
                        <>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            Unlock to Download
                        </>
                    ) : (
                        <>
                            Download PDF
                        </>
                    )}
                </button>

                <button
                    onClick={async () => {
                        if (isCurrentlyLocked) {
                            trackUpgradeClicked('export_premium_template_docx');
                            window.location.href = '/pricing';
                            return;
                        }
                        try {
                            setIsExportingDocx(true);
                            await exportToDocx(result.resumeId, {
                                text: '',
                                template: exportTemplate,
                                font: exportFont,
                                appliedEdits: appliedEdits,
                                sectionOrder: sectionOrder
                            });
                        } catch (error) {
                            console.error('Failed to export DOCX:', error);
                        } finally {
                            setIsExportingDocx(false);
                        }
                    }}
                    disabled={isExportingDocx}
                    className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-lg border-2 mt-4 
                        ${isCurrentlyLocked
                            ? 'border-amber-200 text-amber-500 hover:bg-amber-50'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600'
                        }`}
                >
                    {isExportingDocx ? (
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Download Word DOCX
                        </>
                    )}
                </button>

                {isCurrentlyLocked && (
                    <p className="text-xs text-amber-600 mt-4 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">Current template requires ElevateAI Pro</p>
                )}
            </div>
        );
    };

    return (
        <div className="flex bg-slate-100 overflow-hidden relative w-full h-full" style={{ height: 'calc(100vh - 64px)' }}>

            {/* 1. Thin Left Sidebar Nav */}
            <BuilderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 2. Context Pane (Middle) */}
            <div className="w-80 lg:w-96 border-r border-slate-200 bg-white shadow-xl flex flex-col h-full z-10 overflow-y-auto shrink-0 relative">
                {activeTab === 'ats' && renderAtsCheckPane()}
                {activeTab === 'tailor' && (
                    <JobTailor
                        resumeId={result.resumeId}
                        isPro={!result.isPartialAnalysis}
                        onTailored={(parsedResume) => setTailoredResume(parsedResume)}
                    />
                )}
                {activeTab === 'grammar' && (
                    <GrammarChecker
                        resumeId={result.resumeId}
                        isPro={!result.isPartialAnalysis}
                        onFixPhrase={(phrase) => { trackAiRewriteUsed(); setEditingBullet(phrase); }}
                    />
                )}
                {activeTab === 'templates' && renderTemplatesPane()}
                {activeTab === 'design' && renderDesignPane()}
                {activeTab === 'addSection' && renderAddSectionPane()}
                {activeTab === 'rearrange' && renderRearrangePane()}
                {activeTab === 'download' && renderDownloadPane()}
            </div>

            {/* 3. Live Canvas (Right) */}
            <div className="flex-1 relative h-full flex flex-col items-center justify-start p-4 md:p-8 lg:p-12 overflow-y-auto w-full z-0">
                <div className="w-full max-w-[800px] flex justify-between items-center mb-4 text-slate-500 text-sm font-medium shrink-0">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                        Click any bullet point or field to rewrite it
                    </div>
                    <button
                        onClick={() => setIsLinkedInModalOpen(true)}
                        className="flex items-center gap-1.5 text-[#0A66C2] hover:text-[#004182] font-bold transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-[#0A66C2]/20 hover:bg-[#0A66C2]/5"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        Import LinkedIn Text
                    </button>
                </div>

                <div className="w-full max-w-[800px] bg-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-200 relative shrink-0 transition-transform duration-500" style={{ height: 'min-content', minHeight: '1130px', aspectRatio: '1 / 1.414' }}>
                    {appliedEdits.length > 0 && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            {appliedEdits.length} Unsaved Edit{appliedEdits.length !== 1 ? 's' : ''}
                        </div>
                    )}
                    <ResumeCanvas
                        resumeId={result.resumeId}
                        parsedResume={tailoredResume || result.parsedResume}
                        template={exportTemplate as any}
                        font={exportFont}
                        appliedEdits={appliedEdits}
                        sectionOrder={sectionOrder}
                        weaknesses={result.weaknesses}
                        foundKeywords={result.foundKeywords}
                        missingKeywords={result.missingKeywords}
                        showHeatmap={showHeatmap}
                        isPro={!result.isPartialAnalysis}
                        onPhraseClick={(phrase) => { trackAiRewriteUsed(); setEditingBullet(phrase); }}
                    />
                    {result.isPartialAnalysis && exportTemplate !== 'basic' && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
                            <div className="transform -rotate-45 text-slate-900/[0.03] text-[150px] font-black tracking-tighter select-none">
                                LOCKED
                            </div>
                        </div>
                    )}
                </div>

                {/* Visual Canvas Padding at Bottom */}
                <div className="h-16 w-full shrink-0"></div>
            </div>

            <LinkedInImport
                isOpen={isLinkedInModalOpen}
                onClose={() => setIsLinkedInModalOpen(false)}
                resumeId={result.resumeId}
                isPro={!result.isPartialAnalysis}
                onImported={(parsedResume) => setTailoredResume(parsedResume)}
            />

            {/* Editing Overlay Global Context */}
            {editingBullet && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm shadow-2xl">
                    <MagicWandEditor
                        initialText={editingBullet}
                        onClose={() => setEditingBullet(null)}
                        onApply={handleApplyEdit}
                    />
                </div>
            )}
        </div>
    );
};