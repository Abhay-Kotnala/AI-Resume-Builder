import React, { useCallback, useRef } from 'react';
import { ParsedResumeDTO, ExperienceDTO, EducationDTO } from '../services/api';
import { patchParsedResume } from '../services/api';

export type CanvasTemplate = 'basic' | 'modern' | 'executive';

interface AppliedEdit {
    original: string;
    enhanced: string;
}

interface ResumeCanvasProps {
    resumeId: number;
    parsedResume?: ParsedResumeDTO;
    template?: CanvasTemplate;
    font?: string;
    appliedEdits?: AppliedEdit[];
    sectionOrder?: string[];
    weaknesses?: string;
    foundKeywords?: string;
    missingKeywords?: string;
    showHeatmap?: boolean;
    isPro?: boolean;
    onFieldChange?: (field: string, value: string, expIndex?: number, eduIndex?: number) => void;
    onPhraseClick?: (phrase: string) => void;
}

// ── Editable span / div helpers ────────────────────────────────────────────────
interface EditableProps {
    tag?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
    value: string;
    onBlur: (newVal: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}

const Editable: React.FC<EditableProps> = ({ tag = 'span', value, onBlur, className, style, placeholder }) => {
    const ref = useRef<HTMLElement>(null);
    const Tag = tag as any;

    const handleBlur = useCallback(() => {
        if (ref.current) {
            onBlur(ref.current.innerHTML);
        }
    }, [onBlur]);

    return (
        <Tag
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            dangerouslySetInnerHTML={{ __html: value || '' }}
            data-placeholder={placeholder}
            className={`outline-none focus:bg-blue-50/40 focus:ring-1 focus:ring-blue-300 rounded transition-colors cursor-text ${className ?? ''}`}
            style={{ minHeight: '1em', ...style }}
            title="Click to edit"
        />
    );
};

// ── Apply edits helper ─────────────────────────────────────────────────────────
function applyEdits(text: string, edits: AppliedEdit[]): string {
    let result = text || '';
    for (const { original, enhanced } of edits) {
        if (original && enhanced) {
            result = result.split(original).join(enhanced);
        }
    }
    return result;
}

// ── Heatmap highlight helper — 3-tier: green (found), red (weak) ───────────────
function highlightAllPhrases(
    text: string,
    weaknesses: string,
    foundKeywords: string,
    onPhraseClick?: (phrase: string) => void
): string {
    if (!text) return text;

    // Build lists
    const weakItems: string[] = weaknesses
        ? weaknesses.split('\n').filter(w => w.trim().length > 0).map(w => w.replace(/^- /, '').trim())
        : [];
    const foundItems: string[] = foundKeywords
        ? foundKeywords.split(',').map(k => k.trim()).filter(k => k.length > 1)
        : [];

    let result = text;

    // Green: matched keywords (apply first so red can override weak phrases)
    for (const kw of foundItems) {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const clickAttr = onPhraseClick ? ` data-phrase="${kw.replace(/"/g, '&quot;')}"` : '';
        result = result.replace(
            new RegExp(`(?<![data-phrase="[^"]*])(${escaped})`, 'i'),
            `<span style="background:rgba(16,185,129,0.18);border-bottom:2px dashed #10b981;border-radius:2px;cursor:default" title="✅ Matched keyword: ${kw}"${clickAttr}>$1</span>`
        );
    }

    // Red: weak phrases — extract quoted snippet or first 5 words
    for (const w of weakItems) {
        const quoted = w.match(/"([^"]+)"/);
        const snippet = quoted ? quoted[1] : w.split(' ').slice(0, 5).join(' ');
        if (snippet.length < 5) continue;
        const escaped = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tooltip = w.replace(/"/g, '&quot;');
        const clickAttr = onPhraseClick ? ` data-phrase="${snippet.replace(/"/g, '&quot;')}" style="background:rgba(253,164,175,0.45);border-bottom:2px dashed #f43f5e;border-radius:2px;cursor:pointer"` : ` style="background:rgba(253,164,175,0.45);border-bottom:2px dashed #f43f5e;border-radius:2px;cursor:default"`;
        result = result.replace(
            new RegExp(`(${escaped})`, 'i'),
            `<span${clickAttr} title="⚠️ ${tooltip}">$1</span>`
        );
    }

    return result;
}


// ══════════════════════════════════════════════════════════════════════════════
//  Template: Classic (Georgia, black/white, border dividers)
// ══════════════════════════════════════════════════════════════════════════════
const ClassicCanvas: React.FC<{
    pr: ParsedResumeDTO;
    font: string;
    edits: AppliedEdit[];
    heatmap: boolean;
    weaknesses: string;
    foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const sectionTitle = (label: string) => (
        <div style={{
            fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
            borderTop: '3px solid #111827', borderBottom: '1px solid #111827',
            marginTop: 24, marginBottom: 12, padding: '6px 0', color: '#111827'
        }}>{label}</div>
    );

    return (
        <div style={{ fontFamily: font, fontSize: 11.5, color: '#111827', lineHeight: 1.6, padding: '60px 72px', background: '#fff', minHeight: '100%' }}>
            {/* Header */}
            <Editable
                tag="h1" value={pr.fullName || 'Your Name'}
                onBlur={v => onPatch('fullName', v)}
                style={{ fontSize: 32, fontWeight: 900, margin: '0 0 6px', borderBottom: '4px solid #111827', paddingBottom: 18, letterSpacing: -1 }}
            />
            <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 28, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {pr.email && <Editable value={pr.email} onBlur={v => onPatch('email', v)} />}
                {pr.phone && <><span>•</span><Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></>}
                {pr.location && <><span>•</span><Editable value={pr.location} onBlur={v => onPatch('location', v)} /></>}
            </div>

            {sectionOrder.map(sec => {
                if (sec === 'Summary' && pr.summary) return (
                    <div key="Summary">
                        {sectionTitle('Professional Summary')}
                        <Editable
                            tag="div"
                            value={hl(pr.summary)}
                            onBlur={v => onPatch('summary', v)}
                            style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                        />
                    </div>
                );

                if (sec === 'Experience' && pr.experiences?.length) return (
                    <div key="Experience">
                        {sectionTitle('Work Experience')}
                        {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                            <div key={i} style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 4 }}>
                                    <Editable value={`${exp.role || ''} at ${exp.company || ''}`}
                                        onBlur={v => {
                                            const parts = v.split(' at ');
                                            onPatch('expRole', parts[0]?.trim() || '', i);
                                            if (parts[1]) onPatch('expCompany', parts[1].trim(), i);
                                        }} />
                                    <Editable value={exp.dates || ''} onBlur={v => onPatch('expDates', v, i)}
                                        style={{ color: '#6b7280', fontSize: 10.5 }} />
                                </div>
                                <Editable
                                    tag="div"
                                    value={hl(exp.summary || '')}
                                    onBlur={v => onPatch('expSummary', v, i)}
                                    style={{ marginLeft: 12, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                                />
                            </div>
                        ))}
                    </div>
                );

                if (sec === 'Education' && pr.educations?.length) return (
                    <div key="Education">
                        {sectionTitle('Education')}
                        {pr.educations.map((edu: EducationDTO, i: number) => (
                            <div key={i} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)} />
                                    <span style={{ color: '#6b7280', fontSize: 10.5 }}>{edu.graduationDate}</span>
                                </div>
                                <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                    style={{ fontWeight: 500, marginTop: 2 }} />
                            </div>
                        ))}
                    </div>
                );

                if (sec === 'Skills' && pr.skills?.length) return (
                    <div key="Skills">
                        {sectionTitle('Skills')}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', lineHeight: 1.8 }}>
                            {pr.skills.map((skill, i) => (
                                <span key={i} style={{ fontSize: 11 }}>• {skill}</span>
                            ))}
                        </div>
                    </div>
                );

                return null;
            })}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Modern (accent sidebar, Inter sans-serif)
// ══════════════════════════════════════════════════════════════════════════════
const ModernCanvas: React.FC<{
    pr: ParsedResumeDTO;
    font: string;
    edits: AppliedEdit[];
    heatmap: boolean;
    weaknesses: string;
    foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const accentColor = '#10b981';
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);

    return (
        <div style={{ fontFamily: font, fontSize: 11.5, color: '#111827', lineHeight: 1.6, display: 'flex', minHeight: '100%', background: '#fff' }}>
            {/* Left sidebar */}
            <div style={{ width: 220, background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '48px 24px', flexShrink: 0 }}>
                <Editable tag="h1" value={pr.fullName || 'Your Name'}
                    onBlur={v => onPatch('fullName', v)}
                    style={{ fontSize: 22, fontWeight: 900, color: accentColor, lineHeight: 1.2, marginBottom: 6 }} />
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 24, lineHeight: 1.8 }}>
                    {pr.email && <div>✉ <Editable value={pr.email} onBlur={v => onPatch('email', v)} /></div>}
                    {pr.phone && <div>☎ <Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></div>}
                    {pr.location && <div>📍 <Editable value={pr.location} onBlur={v => onPatch('location', v)} /></div>}
                </div>

                {pr.skills?.length ? (
                    <>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: 4, marginBottom: 10 }}>Skills</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {pr.skills.map((s, i) => (
                                <span key={i} style={{ fontSize: 10.5, background: '#e8f5f1', color: '#065f46', padding: '2px 8px', borderRadius: 4 }}>{s}</span>
                            ))}
                        </div>
                    </>
                ) : null}
            </div>

            {/* Right main content */}
            <div style={{ flex: 1, padding: '48px 40px' }}>
                {sectionOrder.filter(s => s !== 'Skills').map(sec => {
                    const heading = (label: string) => (
                        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: 4, marginTop: 28, marginBottom: 14 }}>{label}</div>
                    );

                    if (sec === 'Summary' && pr.summary) return (
                        <div key="Summary">
                            {heading('Profile')}
                            <Editable tag="div"
                                value={hl(pr.summary)}
                                onBlur={v => onPatch('summary', v)}
                                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 11 }} />
                        </div>
                    );

                    if (sec === 'Experience' && pr.experiences?.length) return (
                        <div key="Experience">
                            {heading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <Editable value={exp.role || 'Role'} onBlur={v => onPatch('expRole', v, i)}
                                            style={{ fontWeight: 700, fontSize: 12.5 }} />
                                        <Editable value={exp.dates || ''} onBlur={v => onPatch('expDates', v, i)}
                                            style={{ color: '#64748b', fontSize: 10 }} />
                                    </div>
                                    <Editable value={exp.company || 'Company'} onBlur={v => onPatch('expCompany', v, i)}
                                        style={{ color: accentColor, fontWeight: 600, fontSize: 11, marginBottom: 4 }} />
                                    <Editable tag="div"
                                        value={hl(exp.summary || '')}
                                        onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ marginLeft: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 11, color: '#334155' }} />
                                </div>
                            ))}
                        </div>
                    );

                    if (sec === 'Education' && pr.educations?.length) return (
                        <div key="Education">
                            {heading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)}
                                            style={{ fontWeight: 700 }} />
                                        <span style={{ color: '#64748b', fontSize: 10.5 }}>{edu.graduationDate}</span>
                                    </div>
                                    <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                        style={{ color: '#475569', fontSize: 11 }} />
                                </div>
                            ))}
                        </div>
                    );

                    return null;
                })}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Executive (dark left header column + right content)
// ══════════════════════════════════════════════════════════════════════════════
const ExecutiveCanvas: React.FC<{
    pr: ParsedResumeDTO;
    font: string;
    edits: AppliedEdit[];
    heatmap: boolean;
    weaknesses: string;
    foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const heading = (label: string) => (
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 4, marginTop: 28, marginBottom: 12 }}>{label}</div>
    );

    return (
        <div style={{ fontFamily: font, fontSize: 11.5, color: '#111827', lineHeight: 1.6, background: '#fff', minHeight: '100%' }}>
            {/* Dark header band */}
            <div style={{ background: '#1e3a5f', color: '#fff', padding: '40px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Editable tag="h1" value={pr.fullName || 'Your Name'}
                        onBlur={v => onPatch('fullName', v)}
                        style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: 0, color: '#fff' }} />
                    {pr.location && <Editable value={pr.location} onBlur={v => onPatch('location', v)}
                        style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }} />}
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'right', lineHeight: 1.9 }}>
                    {pr.email && <div><Editable value={pr.email} onBlur={v => onPatch('email', v)} style={{ color: '#cbd5e1' }} /></div>}
                    {pr.phone && <div><Editable value={pr.phone} onBlur={v => onPatch('phone', v)} style={{ color: '#cbd5e1' }} /></div>}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 56px' }}>
                {sectionOrder.map(sec => {
                    if (sec === 'Summary' && pr.summary) return (
                        <div key="Summary">
                            {heading('Executive Summary')}
                            <Editable tag="div"
                                value={hl(pr.summary)}
                                onBlur={v => onPatch('summary', v)}
                                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#334155' }} />
                        </div>
                    );

                    if (sec === 'Skills' && pr.skills?.length) return (
                        <div key="Skills">
                            {heading('Core Competencies')}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 24px' }}>
                                {pr.skills.map((s, i) => (
                                    <span key={i} style={{ fontSize: 11, padding: '2px 0', borderBottom: '1px solid #e2e8f0' }}>◆ {s}</span>
                                ))}
                            </div>
                        </div>
                    );

                    if (sec === 'Experience' && pr.experiences?.length) return (
                        <div key="Experience">
                            {heading('Professional Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f1f5f9', padding: '6px 12px', borderLeft: '4px solid #1e3a5f', borderRadius: '0 6px 6px 0' }}>
                                        <div>
                                            <Editable value={exp.role || 'Role'} onBlur={v => onPatch('expRole', v, i)}
                                                style={{ fontWeight: 700, fontSize: 12.5, color: '#1e3a5f' }} />
                                            <Editable value={exp.company || 'Company'} onBlur={v => onPatch('expCompany', v, i)}
                                                style={{ fontSize: 11, color: '#475569' }} />
                                        </div>
                                        <Editable value={exp.dates || ''} onBlur={v => onPatch('expDates', v, i)}
                                            style={{ fontSize: 10.5, color: '#64748b', alignSelf: 'center' }} />
                                    </div>
                                    <Editable tag="div"
                                        value={hl(exp.summary || '')}
                                        onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ marginLeft: 16, marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#334155' }} />
                                </div>
                            ))}
                        </div>
                    );

                    if (sec === 'Education' && pr.educations?.length) return (
                        <div key="Education">
                            {heading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div>
                                        <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                            style={{ fontWeight: 700 }} />
                                        <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)}
                                            style={{ color: '#475569', fontSize: 11 }} />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: 10.5 }}>{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    );

                    return null;
                })}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Main ResumeCanvas export
// ══════════════════════════════════════════════════════════════════════════════
export const ResumeCanvas: React.FC<ResumeCanvasProps> = ({
    resumeId,
    parsedResume,
    template = 'basic',
    font = 'Georgia, serif',
    appliedEdits = [],
    sectionOrder = ['Summary', 'Experience', 'Education', 'Skills'],
    weaknesses = '',
    foundKeywords = '',
    showHeatmap = false,
    isPro = true,
    onFieldChange,
    onPhraseClick,
}) => {
    const handlePatch = useCallback(async (field: string, value: string, expIndex?: number, eduIndex?: number) => {
        onFieldChange?.(field, value, expIndex, eduIndex);
        try {
            await patchParsedResume(resumeId, field, value, expIndex, eduIndex);
        } catch (err) {
            console.error('Failed to save field:', field, err);
        }
    }, [resumeId, onFieldChange]);

    // Fallback: no parsedResume yet (edge case: upload still processing)
    if (!parsedResume) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400 p-8">
                <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <div className="text-center">
                    <p className="font-bold text-slate-600 text-lg">No Resume Data</p>
                    <p className="text-sm mt-1">Upload a resume to see your live canvas.</p>
                </div>
            </div>
        );
    }

    const commonProps = {
        pr: parsedResume,
        font,
        edits: appliedEdits,
        heatmap: showHeatmap,
        weaknesses,
        foundKeywords,
        sectionOrder,
        onPatch: handlePatch,
        onPhraseClick,
    };

    return (
        <div className="relative w-full h-full bg-white overflow-auto" style={{ minHeight: '1130px' }}>
            {/* Watermark for free users */}
            {!isPro && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    fontSize: 80, fontWeight: 900, color: 'rgba(200,200,200,0.18)',
                    zIndex: 0, whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none'
                }}>Created with ElevateAI</div>
            )}

            {/* Canvas hint */}
            <div className="absolute top-3 right-3 z-10 text-[10px] font-bold text-slate-400 bg-white/80 border border-slate-200 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Click any field to edit
            </div>

            <div className="relative z-[1]" style={{ pointerEvents: 'auto' }}>
                {template === 'basic' && <ClassicCanvas {...commonProps} />}
                {template === 'modern' && <ModernCanvas {...commonProps} />}
                {template === 'executive' && <ExecutiveCanvas {...commonProps} />}
            </div>
        </div>
    );
};
