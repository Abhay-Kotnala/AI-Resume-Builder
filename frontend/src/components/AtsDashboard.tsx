import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResponse, exportToPdf, exportToDocx, getAuthHeaders } from '../services/api';
import { MagicWandEditor } from './MagicWandEditor';
import { BuilderSidebar, BuilderTab } from './BuilderSidebar';
import { ResumeCanvas } from './ResumeCanvas';
import { trackPdfExported, trackAiRewriteUsed, trackUpgradeClicked } from '../services/analytics';
import { useAuth } from '../context/AuthContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface AtsDashboardProps {
    result: AnalysisResponse;
    onCheckAnother?: () => void;
}

// ── ATS Score Overlay Badge ────────────────────────────────────────────────────
interface ScoreOverlayBadgeProps {
    atsScore: number;
    impactScore: number;
    formattingScore: number;
    keywordsScore: number;
}

const ScoreOverlayBadge: React.FC<ScoreOverlayBadgeProps> = ({ atsScore, impactScore, formattingScore, keywordsScore }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * atsScore) / 100;

    const ringColor = atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#f43f5e';
    const bgGlow = atsScore >= 80 ? 'rgba(16,185,129,0.12)' : atsScore >= 60 ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)';
    const labelColor = atsScore >= 80 ? '#065f46' : atsScore >= 60 ? '#92400e' : '#9f1239';

    const subscores = [
        { label: 'Impact', value: impactScore, color: '#6366f1' },
        { label: 'Format', value: formattingScore, color: '#8b5cf6' },
        { label: 'Keywords', value: keywordsScore, color: '#f59e0b' },
    ];

    return (
        <div className="group absolute top-4 right-4 z-20 flex flex-col items-end gap-2 select-none transform origin-top-right scale-90 hover:scale-100 transition-transform">
            {/* Main ring badge */}
            <div
                className="flex flex-col items-center justify-center cursor-default rounded-2xl px-3 py-2.5 shadow-xl border backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
                style={{ background: bgGlow, borderColor: ringColor + '55' }}
                title={`ATS Score: ${atsScore}/100`}
            >
                <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
                        {/* Track */}
                        <circle cx="26" cy="26" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="5" />
                        {/* Progress */}
                        <circle
                            cx="26" cy="26" r={radius}
                            fill="none"
                            stroke={ringColor}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
                        />
                    </svg>
                    <span className="absolute text-sm font-black" style={{ color: ringColor }}>{atsScore}</span>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest mt-0.5" style={{ color: labelColor }}>ATS Score</span>
            </div>

            {/* Subscore pills — visible on hover */}
            <div className="flex flex-col gap-1.5 items-end overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-300 ease-in-out">
                {subscores.map(({ label, value, color }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-slate-100"
                    >
                        <span className="text-[10px] font-bold text-slate-500 w-14 text-right">{label}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${value}%`, background: color }}
                            />
                        </div>
                        <span className="text-[10px] font-extrabold w-6" style={{ color }}>{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Drag-and-Drop Sortable Item ────────────────────────────────────────────────
interface SortableSectionItemProps {
    id: string;
    onRemove: (id: string) => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({ id, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 999 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border transition-shadow ${isDragging
                ? 'border-indigo-400 shadow-lg ring-2 ring-indigo-300'
                : 'border-slate-200 hover:border-slate-300'
                }`}
        >
            {/* Drag Handle — binds pointer/keyboard listeners so only the grip initiates drag */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500 transition-colors touch-none select-none"
                title="Drag to reorder"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM16 6a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 11-4 0 2 2 0 014 0zM16 18a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>

            <span className="font-semibold text-slate-700 flex-1 text-sm">{id}</span>

            <button
                onClick={() => onRemove(id)}
                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                title={`Remove ${id} section`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};

export const AtsDashboard: React.FC<AtsDashboardProps> = ({ result, onCheckAnother }) => {
    const { user } = useAuth();
    const [editingBullet, setEditingBullet] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<BuilderTab>('ats');
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasScale, setCanvasScale] = useState(1);

    // Responsive canvas scaling
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current && canvasRef.current) {
                // The canvas has a fixed width of 800px logic in ResumeCanvas.
                // We want to scale it down if the container is smaller than 800px + padding.
                const containerWidth = containerRef.current.clientWidth;
                const padding = 32; // 16px each side min padding
                const targetWidth = containerWidth - padding;
                const baseWidth = 800;

                if (targetWidth < baseWidth) {
                    setCanvasScale(targetWidth / baseWidth);
                } else {
                    setCanvasScale(1);
                }
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

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

    // ── Cover Letter State ───────────────────────────────────
    const [clJobDesc, setClJobDesc] = useState('');
    const [clTone, setClTone] = useState('professional');
    const [clOutput, setClOutput] = useState('');
    const [clLoading, setClLoading] = useState(false);
    const [clError, setClError] = useState('');

    // ── Job Match State ──────────────────────────────────────
    const [jmJobDesc, setJmJobDesc] = useState('');
    const [jmOutput, setJmOutput] = useState<{ matchScore?: number; missingSkills?: string; matchedSkills?: string; recommendation?: string } | null>(null);
    const [jmLoading, setJmLoading] = useState(false);
    const [jmError, setJmError] = useState('');

    // ── Interview Prep State ─────────────────────────────────
    const [ivJobTitle, setIvJobTitle] = useState('');
    const [ivOutput, setIvOutput] = useState('');
    const [ivLoading, setIvLoading] = useState(false);
    const [ivError, setIvError] = useState('');

    // Generic job poller
    const pollJobResult = async (jobId: string): Promise<any> => {
        const JOBS_URL = `${import.meta.env.VITE_API_BASE_URL}/api/jobs`;
        for (let i = 0; i < 60; i++) {
            const r = await fetch(`${JOBS_URL}/${jobId}`, { headers: getAuthHeaders() });
            const data = await r.json();
            if (data.status === 'COMPLETED') return data.result;
            if (data.status === 'FAILED') throw new Error(data.error || 'Job failed');
            await new Promise(res => setTimeout(res, 2000));
        }
        throw new Error('Timed out waiting for AI response');
    };


    // Callback fired by MagicWandEditor when user clicks 'Apply to Preview'
    const handleApplyEdit = (original: string, enhanced: string) => {
        setAppliedEdits(prev => {
            // Replace existing edit for the same original text, or append
            const next = prev.filter(e => e.original !== original);
            return [...next, { original, enhanced }];
        });
    };

    // Calculate dynamic scores based on applied edits to create a real-time reward loop (Phase 2.2)
    const baseAtsScore = result.atsScore || 0;
    const baseImpactScore = result.impactScore || 0;
    const baseFormattingScore = result.formattingScore || 0;
    const baseKeywordsScore = result.keywordsScore || 0;

    // We boost Impact score slightly more than others per edit, assuming edits use the "Magic Wand" which focuses on impact
    const scoreBoost = appliedEdits.length;
    const dynamicAtsScore = Math.min(100, baseAtsScore + (scoreBoost * 3));
    const dynamicImpactScore = Math.min(100, baseImpactScore + (scoreBoost * 4));
    const dynamicFormattingScore = Math.min(100, baseFormattingScore + (scoreBoost * 1));
    const dynamicKeywordsScore = Math.min(100, baseKeywordsScore + (scoreBoost * 2));



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
            <div className={`p-4 rounded-3xl border transition-colors duration-500 ${getScoreLightBg(dynamicAtsScore)}`}>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            ATS Analysis
                            <div className="group relative z-50">
                                <svg className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {/* Tooltip */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900 text-white text-[11px] leading-relaxed p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="font-bold mb-1 text-emerald-400">Score Breakdown:</div>
                                    This score calculates how well your resume matches the job description and passes parsing software. <br /><br />
                                    • <strong className="text-emerald-300">80+</strong> (Good) - Ready to apply<br />
                                    • <strong className="text-amber-300">60-79</strong> (Okay) - Needs minor tweaks<br />
                                    • <strong className="text-rose-300">&lt;60</strong> (Poor) - Needs major rewrite
                                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                </div>
                            </div>
                        </h2>
                        <p className="text-slate-600 font-medium mt-1 text-xs">How your resume scored against algorithms.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * dynamicAtsScore) / 100} className={`${getScoreColor(dynamicAtsScore)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className={`text-2xl font-extrabold tracking-tighter ${getScoreColor(dynamicAtsScore)} transition-colors duration-1000`}>{dynamicAtsScore}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {[
                            { label: 'Impact', score: dynamicImpactScore, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                            { label: 'Formatting', score: dynamicFormattingScore, color: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100' },
                            { label: 'Keywords', score: dynamicKeywordsScore, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' }
                        ].map((item, idx) => (
                            <div key={idx} className={`${item.bg} ${item.border} rounded-xl p-2 border shadow-sm text-center transition-colors duration-500`}>
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
                    <ul className="space-y-3">
                        {strengthsList.map((strength, index) => {
                            const ltext = strength.toLowerCase();
                            const type = ltext.includes('metric') || ltext.includes('quantif') || ltext.includes('impact') || ltext.includes('verb') ? 'Impact' :
                                ltext.includes('keyword') || ltext.includes('skill') || ltext.includes('match') ? 'Keywords' : 'Formatting';
                            const tColor = type === 'Impact' ? 'text-blue-600 bg-blue-50 border-blue-200' : type === 'Keywords' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-violet-600 bg-violet-50 border-violet-200';

                            return (
                                <li key={index} className="flex gap-2 text-emerald-700 text-xs items-start">
                                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <span className="leading-relaxed">{strength}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tColor}`}>{type}</span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Opportunities to Improve
                    </h3>
                    <ul className="space-y-4">
                        {weaknessesList.map((weakness, index) => {
                            const ltext = weakness.toLowerCase();
                            const type = ltext.includes('metric') || ltext.includes('quantif') || ltext.includes('impact') || ltext.includes('verb') ? 'Impact' :
                                ltext.includes('keyword') || ltext.includes('skill') || ltext.includes('match') ? 'Keywords' : 'Formatting';
                            const tColor = type === 'Impact' ? 'text-blue-600 bg-blue-50 border-blue-200' : type === 'Keywords' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-violet-600 bg-violet-50 border-violet-200';

                            return (
                                <li key={index} className="flex gap-2 text-amber-800 items-start text-xs border-b border-amber-100/50 pb-3 last:border-0 last:pb-0">
                                    <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <span className="leading-relaxed">{weakness}</span>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mt-0.5">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tColor}`}>{type}</span>

                                            <button
                                                onClick={() => { trackAiRewriteUsed(); setEditingBullet(weakness); }}
                                                className="text-[10px] font-bold inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg border border-indigo-200 shadow-sm transition-colors shrink-0 whitespace-nowrap"
                                            >
                                                ✨ Fix with AI
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* ATS Heatmap Scorecard */}
            {(foundKeywordsList.length > 0 || missingKeywordsList.length > 0) && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {/* Heatmap toggle header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">🔥 Keyword Heatmap</span>
                        <button
                            onClick={() => setShowHeatmap(prev => !prev)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${showHeatmap
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200/50'
                                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${showHeatmap ? 'bg-white' : 'bg-slate-400'}`} />
                            {showHeatmap ? 'Live — ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Match score bar */}
                        {foundKeywordsList.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Keyword Match</span>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {foundKeywordsList.length} of {foundKeywordsList.length + missingKeywordsList.length} matched
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                                        style={{ width: `${Math.round((foundKeywordsList.length / (foundKeywordsList.length + missingKeywordsList.length)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Found keywords */}
                        {foundKeywordsList.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                    Matched Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {foundKeywordsList.map((kw, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Missing keywords */}
                        {missingKeywordsList.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                                    Missing Keywords — Add These
                                </h4>
                                <div className="flex flex-wrap gap-1.5 relative">
                                    <div className={`flex flex-wrap gap-1.5 ${result.isPartialAnalysis ? 'blur-[3px] select-none opacity-60' : ''}`}>
                                        {missingKeywordsList.map((kw, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-lg border border-rose-200 dark:border-rose-700 flex items-center gap-1">
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                    {result.isPartialAnalysis && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 w-full">
                                            <button onClick={() => window.location.href = '/pricing'} className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-extrabold rounded-xl shadow-lg hover:bg-slate-700 transition-colors">
                                                🔒 Upgrade to See All
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="flex items-center gap-4 pt-1 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-medium">Legend:</span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Matched
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Missing
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Weak Phrase
                            </span>
                        </div>
                    </div>
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
                    const isLocked = (result.isPartialAnalysis || (!user?.isPro && (user?.scansUsed ?? 0) >= 4)) && (tpl as any).pro;

                    return (
                        <button
                            key={tpl.id}
                            onClick={() => setExportTemplate(tpl.id)}
                            className={`flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all duration-200 group text-left relative overflow-hidden
                                ${isSelected ? 'border-indigo-500 bg-indigo-50/30 shadow-indigo-100/50 shadow-lg' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                        >
                            <div className="w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                                <img
                                    src={tpl.img}
                                    alt={tpl.label}
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.tpl-placeholder')) {
                                            const ph = document.createElement('div');
                                            ph.className = 'tpl-placeholder absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100';
                                            ph.innerHTML = `<svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span style="font-size:11px;font-weight:700;color:#94a3b8">${tpl.label}</span>`;
                                            parent.appendChild(ph);
                                        }
                                    }}
                                />
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

    const handleRemove = (secTitle: string) => {
        setSectionOrder(prev => prev.filter(s => s !== secTitle));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSectionOrder(prev => {
                const oldIndex = prev.indexOf(active.id as string);
                const newIndex = prev.indexOf(over.id as string);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const renderRearrangePane = () => (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-full">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                Rearrange Layout
            </h2>
            <p className="text-slate-500 text-sm mb-6">Drag the ⠿ handle to reorder resume sections.</p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {sectionOrder.map(sec => (
                            <SortableSectionItem key={sec} id={sec} onRemove={handleRemove} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {sectionOrder.length === 0 && (
                <div className="text-center text-slate-400 mt-8 font-medium">No sections added yet.<br />Go to Add Section!</div>
            )}
        </div>
    );

    const renderCoverLetterPane = () => (
        <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <h2 className="text-lg font-extrabold text-slate-800">Cover Letter Generator</h2>
            </div>
            <p className="text-xs text-slate-500">Generate a tailored cover letter from your resume using AI.</p>
            <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Tone</label>
                <select value={clTone} onChange={e => setClTone(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="concise">Concise</option>
                    <option value="formal">Formal</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Job Description (optional)</label>
                <textarea value={clJobDesc} onChange={e => setClJobDesc(e.target.value)} rows={4} placeholder="Paste the job description here..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
            <button onClick={async () => {
                setClLoading(true); setClError(''); setClOutput('');
                try {
                    const { getAuthHeaders, API_BASE_URL } = await import('../services/api');
                    const r = await fetch(`${API_BASE_URL}/${result.resumeId}/cover-letter`, { method: 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ jobDescription: clJobDesc, tone: clTone }) });
                    const data = await r.json();
                    if (!r.ok) { setClError(data.message || data.error || 'Failed'); setClLoading(false); return; }
                    const res = await pollJobResult(data.jobId);
                    setClOutput(res.coverLetter || '');
                } catch (e: any) { setClError(e.message); } finally { setClLoading(false); }
            }} disabled={clLoading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
                {clLoading ? '✨ Generating...' : '✨ Generate Cover Letter'}
            </button>
            {clError && <p className="text-rose-500 text-xs">{clError}</p>}
            {clOutput && (
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-600">Your Cover Letter</span>
                        <button onClick={() => navigator.clipboard.writeText(clOutput)} className="text-xs text-violet-600 font-bold hover:underline">Copy</button>
                    </div>
                    <textarea readOnly value={clOutput} rows={12} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 resize-none" />
                </div>
            )}
        </div>
    );

    const renderJobMatchPane = () => (
        <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <h2 className="text-lg font-extrabold text-slate-800">Job Match Engine</h2>
            </div>
            <p className="text-xs text-slate-500">Paste a job description to see how well your resume matches it.</p>
            <textarea value={jmJobDesc} onChange={e => setJmJobDesc(e.target.value)} rows={6} placeholder="Paste the full job description here..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
            <button onClick={async () => {
                if (!jmJobDesc.trim()) return;
                setJmLoading(true); setJmError(''); setJmOutput(null);
                try {
                    const { getAuthHeaders, API_BASE_URL } = await import('../services/api');
                    const r = await fetch(`${API_BASE_URL}/${result.resumeId}/match`, { method: 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ jobDescription: jmJobDesc }) });
                    const data = await r.json();
                    if (!r.ok) { setJmError(data.message || data.error || 'Failed'); setJmLoading(false); return; }
                    const res = await pollJobResult(data.jobId);
                    setJmOutput(res);
                } catch (e: any) { setJmError(e.message); } finally { setJmLoading(false); }
            }} disabled={jmLoading || !jmJobDesc.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
                {jmLoading ? '🔍 Analyzing...' : '🔍 Analyze Match'}
            </button>
            {jmError && <p className="text-rose-500 text-xs">{jmError}</p>}
            {jmOutput && (
                <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-5xl font-black ${(jmOutput.matchScore ?? 0) >= 70 ? 'text-emerald-500' : (jmOutput.matchScore ?? 0) >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{jmOutput.matchScore ?? 0}%</div>
                            <div className="text-xs text-slate-500 font-semibold mt-1">Match Score</div>
                        </div>
                    </div>
                    {jmOutput.matchedSkills && <div><div className="text-xs font-bold text-emerald-700 mb-1">✅ Matched Skills</div><p className="text-xs text-slate-600 bg-emerald-50 p-2 rounded-lg">{jmOutput.matchedSkills}</p></div>}
                    {jmOutput.missingSkills && <div><div className="text-xs font-bold text-rose-700 mb-1">⚠️ Missing Skills</div><p className="text-xs text-slate-600 bg-rose-50 p-2 rounded-lg">{jmOutput.missingSkills}</p></div>}
                    {jmOutput.recommendation && <div><div className="text-xs font-bold text-blue-700 mb-1">💡 Recommendation</div><p className="text-xs text-slate-600 bg-blue-50 p-2 rounded-lg">{jmOutput.recommendation}</p></div>}
                </div>
            )}
        </div>
    );

    const renderInterviewPane = () => (
        <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <h2 className="text-lg font-extrabold text-slate-800">AI Interview Prep</h2>
            </div>
            <p className="text-xs text-slate-500">Get personalized interview questions and answers based on your resume.</p>
            <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Target Job Title</label>
                <input value={ivJobTitle} onChange={e => setIvJobTitle(e.target.value)} type="text" placeholder="e.g. Senior Software Engineer" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={async () => {
                setIvLoading(true); setIvError(''); setIvOutput('');
                try {
                    const { getAuthHeaders, API_BASE_URL } = await import('../services/api');
                    const r = await fetch(`${API_BASE_URL}/${result.resumeId}/interview-questions`, { method: 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ jobTitle: ivJobTitle }) });
                    const data = await r.json();
                    if (!r.ok) { setIvError(data.message || data.error || 'Failed'); setIvLoading(false); return; }
                    const res = await pollJobResult(data.jobId);
                    setIvOutput(res.questions || res.interviewQuestions || JSON.stringify(res));
                } catch (e: any) { setIvError(e.message); } finally { setIvLoading(false); }
            }} disabled={ivLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
                {ivLoading ? '🎯 Generating Questions...' : '🎯 Generate Interview Questions'}
            </button>
            {ivError && <p className="text-rose-500 text-xs">{ivError}</p>}
            {ivOutput && (
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-600">Interview Questions</span>
                        <button onClick={() => navigator.clipboard.writeText(ivOutput)} className="text-xs text-amber-600 font-bold hover:underline">Copy</button>
                    </div>
                    <div className="text-xs text-slate-700 bg-amber-50 border border-amber-100 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">{ivOutput}</div>
                </div>
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

        const isCurrentlyLocked = (result.isPartialAnalysis || (!user?.isPro && (user?.scansUsed ?? 0) >= 4)) && (selectedTplConfig as any)?.pro;

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
        <div className="flex flex-col lg:flex-row bg-slate-100 overflow-hidden relative w-full h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]">

            {/* 1. Thin Left Sidebar Nav (Mobile: Bottom bar) */}
            <BuilderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* 2. Context Pane (Middle) */}
            <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white shadow-xl flex flex-col z-30 lg:z-10 overflow-y-auto shrink-0 relative lg:h-full max-h-[50vh] lg:max-h-none order-first lg:order-none">
                {activeTab === 'ats' && renderAtsCheckPane()}
                {activeTab === 'templates' && renderTemplatesPane()}
                {activeTab === 'design' && renderDesignPane()}
                {activeTab === 'addSection' && renderAddSectionPane()}
                {activeTab === 'rearrange' && renderRearrangePane()}
                {activeTab === 'download' && renderDownloadPane()}
                {activeTab === 'coverLetter' && renderCoverLetterPane()}
                {activeTab === 'jobMatch' && renderJobMatchPane()}
                {activeTab === 'interview' && renderInterviewPane()}
            </div>

            {/* 3. Live Canvas (Right) */}
            <div ref={containerRef} className="flex-1 relative h-full flex flex-col items-center justify-start p-2 sm:p-4 lg:p-8 xl:p-12 overflow-y-auto w-full z-0 overflow-x-hidden order-1 lg:order-none">
                <div className="w-full max-w-[800px] flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-4 text-slate-500 text-sm font-medium shrink-0">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                        {onCheckAnother && (
                            <button
                                onClick={onCheckAnother}
                                className="flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 font-extrabold transition-all px-5 py-2 rounded-xl shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                Start New Scan
                            </button>
                        )}
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            Click any bullet point or field to rewrite it
                        </div>
                    </div>
                </div>

                <div
                    ref={canvasRef}
                    className="w-full max-w-[800px] bg-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-slate-200 relative shrink-0"
                    style={{
                        height: 'min-content',
                        minHeight: '1130px',
                        transform: `scale(${canvasScale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - canvasScale) * 1130}px` // Compensate for scaled shrink
                    }}
                >
                    {/* Phase 2.2: Floating ATS Score Badge */}
                    <ScoreOverlayBadge
                        atsScore={dynamicAtsScore}
                        impactScore={dynamicImpactScore}
                        formattingScore={dynamicFormattingScore}
                        keywordsScore={dynamicKeywordsScore}
                    />
                    {appliedEdits.length > 0 && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            {appliedEdits.length} Unsaved Edit{appliedEdits.length !== 1 ? 's' : ''}
                        </div>
                    )}
                    <ResumeCanvas
                        resumeId={result.resumeId}
                        parsedResume={result.parsedResume}
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
                            <div className="transform -rotate-45 text-slate-900/[0.04] text-[100px] font-black tracking-tighter select-none whitespace-nowrap">
                                ElevateAI
                            </div>
                        </div>
                    )}
                </div>

                {/* Visual Canvas Padding at Bottom */}
                <div className="h-16 w-full shrink-0"></div>
            </div>



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