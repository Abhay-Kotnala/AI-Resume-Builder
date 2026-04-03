import React, { useCallback, useRef } from 'react';
import { ParsedResumeDTO, ExperienceDTO, EducationDTO } from '../services/api';
import { patchParsedResume } from '../services/api';

export type CanvasTemplate = 'basic' | 'modern' | 'executive' | 'tech-focused' | 'minimalist' | 'bold-bw' | 'editorial' | 'olive-sidebar' | 'orange-bold' | 'blue-pro';


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
    onFieldChange?: (field: string, value: string, expIndex?: number, eduIndex?: number, sectionName?: string) => void;
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

    // ── Debounced Autosave (Phase 1.1) ─────────────────────────────────────────
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInput = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            if (ref.current) {
                // If the user's focus is still here, they might still be typing slowly, but we save anyway!
                onBlur(ref.current.innerHTML);
            }
        }, 1500); // 1.5s debounce for a snappy feel without too many requests
    }, [onBlur]);

    // Clean up timer unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const handleBlur = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (ref.current) {
            onBlur(ref.current.innerHTML);
        }
    }, [onBlur]);

    return (
        <Tag
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
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
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
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


                if (!['Summary', 'Experience', 'Education', 'Skills'].includes(sec)) {
                    const customText = pr.customSections?.[sec];
                    if (customText) {
                        return (
                            <div key={sec} style={{ marginBottom: 16 }}>
                                {sectionTitle(sec)}
                                <Editable tag="div"
                                    value={hl(customText)}
                                    onBlur={v => onPatch('customSection', v, undefined, undefined, sec)}
                                    style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} />
                            </div>
                        );
                    }
                }
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
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
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
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
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


                    if (!['Summary', 'Experience', 'Education', 'Skills'].includes(sec)) {
                        const customText = pr.customSections?.[sec];
                        if (customText) {
                            return (
                                <div key={sec} style={{ marginBottom: 16 }}>
                                    {heading(sec)}
                                    <Editable tag="div"
                                        value={hl(customText)}
                                        onBlur={v => onPatch('customSection', v, undefined, undefined, sec)}
                                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} />
                                </div>
                            );
                        }
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Tech-Focused (Dense, two-column layout optimized for engineers)
// ══════════════════════════════════════════════════════════════════════════════
const TechFocusedCanvas: React.FC<{
    pr: ParsedResumeDTO;
    font: string;
    edits: AppliedEdit[];
    heatmap: boolean;
    weaknesses: string;
    foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const heading = (label: string) => (
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginTop: 20, marginBottom: 12 }}>{label}</div>
    );

    return (
        <div style={{ fontFamily: font, fontSize: 11, color: '#334155', lineHeight: 1.5, background: '#fff', minHeight: '100%', padding: '40px 48px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Editable tag="h1" value={pr.fullName || 'Your Name'}
                    onBlur={v => onPatch('fullName', v)}
                    style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }} />
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 10.5, color: '#475569' }}>
                    {pr.email && <Editable value={pr.email} onBlur={v => onPatch('email', v)} />}
                    {pr.phone && <><span>|</span><Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></>}
                    {pr.location && <><span>|</span><Editable value={pr.location} onBlur={v => onPatch('location', v)} /></>}
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'flex', gap: 32 }}>
                {/* Left Column: Skills & Education */}
                <div style={{ width: '32%', flexShrink: 0 }}>
                    {sectionOrder.includes('Skills') && pr.skills?.length ? (
                        <div key="Skills">
                            {heading('Technical Skills')}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {pr.skills.map((s, i) => (
                                    <span key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#0f172a' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {sectionOrder.includes('Education') && pr.educations?.length ? (
                        <div key="Education" style={{ marginTop: 12 }}>
                            {heading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 14 }}>
                                    <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                        style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 2 }} />
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)}
                                        style={{ color: '#475569', fontSize: 10.5, display: 'block' }} />
                                    <span style={{ color: '#64748b', fontSize: 10 }}>{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Right Column: Experience & Summary */}
                <div style={{ flex: 1 }}>
                    {sectionOrder.includes('Summary') && pr.summary ? (
                        <div key="Summary">
                            {heading('Professional Summary')}
                            <Editable tag="div"
                                value={hl(pr.summary)}
                                onBlur={v => onPatch('summary', v)}
                                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }} />
                        </div>
                    ) : null}

                    {sectionOrder.includes('Experience') && pr.experiences?.length ? (
                        <div key="Experience">
                            {heading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                        <Editable value={exp.role || 'Role'} onBlur={v => onPatch('expRole', v, i)}
                                            style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }} />
                                        <Editable value={exp.dates || ''} onBlur={v => onPatch('expDates', v, i)}
                                            style={{ fontSize: 10, color: '#64748b' }} />
                                    </div>
                                    <Editable value={exp.company || 'Company'} onBlur={v => onPatch('expCompany', v, i)}
                                        style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, marginBottom: 6, display: 'block' }} />
                                    <Editable tag="div"
                                        value={hl(exp.summary || '')}
                                        onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, paddingLeft: 12, borderLeft: '2px solid #e2e8f0' }} />
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Minimalist (Clean, elegant layout with lots of whitespace)
// ══════════════════════════════════════════════════════════════════════════════
const MinimalistCanvas: React.FC<{
    pr: ParsedResumeDTO;
    font: string;
    edits: AppliedEdit[];
    heatmap: boolean;
    weaknesses: string;
    foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const heading = (label: string) => (
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: '#9ca3af', marginTop: 32, marginBottom: 16 }}>{label}</div>
    );

    return (
        <div style={{ fontFamily: font, fontSize: 11.5, color: '#4b5563', lineHeight: 1.8, background: '#fff', minHeight: '100%', padding: '60px 80px' }}>
            {/* Header */}
            <Editable tag="h1" value={pr.fullName || 'Your Name'}
                onBlur={v => onPatch('fullName', v)}
                style={{ fontSize: 26, fontWeight: 400, color: '#111827', margin: '0 0 16px', textAlign: 'center', letterSpacing: 1 }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 40 }}>
                {pr.email && <Editable value={pr.email} onBlur={v => onPatch('email', v)} />}
                {pr.phone && <Editable value={pr.phone} onBlur={v => onPatch('phone', v)} />}
                {pr.location && <Editable value={pr.location} onBlur={v => onPatch('location', v)} />}
            </div>

            {sectionOrder.map(sec => {
                if (sec === 'Summary' && pr.summary) return (
                    <div key="Summary">
                        {heading('Profile')}
                        <Editable tag="div"
                            value={hl(pr.summary)}
                            onBlur={v => onPatch('summary', v)}
                            style={{ whiteSpace: 'pre-wrap' }} />
                    </div>
                );

                if (sec === 'Experience' && pr.experiences?.length) return (
                    <div key="Experience">
                        {heading('Experience')}
                        {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                            <div key={i} style={{ marginBottom: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                                    <div>
                                        <Editable value={exp.role || 'Role'} onBlur={v => onPatch('expRole', v, i)}
                                            style={{ fontWeight: 600, fontSize: 12.5, color: '#111827' }} />
                                        <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span>
                                        <Editable value={exp.company || 'Company'} onBlur={v => onPatch('expCompany', v, i)}
                                            style={{ fontSize: 11.5, color: '#6b7280' }} />
                                    </div>
                                    <Editable value={exp.dates || ''} onBlur={v => onPatch('expDates', v, i)}
                                        style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }} />
                                </div>
                                <Editable tag="div"
                                    value={hl(exp.summary || '')}
                                    onBlur={v => onPatch('expSummary', v, i)}
                                    style={{ whiteSpace: 'pre-wrap', marginTop: 8 }} />
                            </div>
                        ))}
                    </div>
                );

                if (sec === 'Education' && pr.educations?.length) return (
                    <div key="Education">
                        {heading('Education')}
                        {pr.educations.map((edu: EducationDTO, i: number) => (
                            <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div>
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)}
                                        style={{ fontWeight: 600, color: '#111827' }} />
                                    <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span>
                                    <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                        style={{ color: '#6b7280' }} />
                                </div>
                                <span style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{edu.graduationDate}</span>
                            </div>
                        ))}
                    </div>
                );

                if (sec === 'Skills' && pr.skills?.length) return (
                    <div key="Skills">
                        {heading('Skills')}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
                            {pr.skills.map((s, i) => (
                                <span key={i} style={{ fontSize: 11, color: '#4b5563' }}>{s}</span>
                            ))}
                        </div>
                    </div>
                );


                if (!['Summary', 'Experience', 'Education', 'Skills'].includes(sec)) {
                    const customText = pr.customSections?.[sec];
                    if (customText) {
                        return (
                            <div key={sec} style={{ marginBottom: 16 }}>
                                {heading(sec)}
                                <Editable tag="div"
                                    value={hl(customText)}
                                    onBlur={v => onPatch('customSection', v, undefined, undefined, sec)}
                                    style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} />
                            </div>
                        );
                    }
                }
                return null;
            })}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Bold B&W (Amy Lee - black header bar, ruled section labels)
// ══════════════════════════════════════════════════════════════════════════════
const BoldBwCanvas: React.FC<{
    pr: ParsedResumeDTO; font: string; edits: AppliedEdit[];
    heatmap: boolean; weaknesses: string; foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const heading = (label: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 22, marginBottom: 12 }}>
            <div style={{ background: '#111', color: '#fff', fontWeight: 800, fontSize: 11, padding: '4px 14px', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap', borderRadius: 2 }}>{label}</div>
            <div style={{ flex: 1, height: 2, background: '#111', marginLeft: 0 }} />
        </div>
    );
    return (
        <div style={{ fontFamily: font, fontSize: 11, color: '#111', lineHeight: 1.5, background: '#fff', minHeight: '100%' }}>
            {/* Black header bar */}
            <div style={{ background: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px' }}>
                <div>
                    <Editable tag="h1" value={pr.fullName || 'Your Name'} onBlur={v => onPatch('fullName', v)}
                        style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#fff', letterSpacing: -0.5 }} />
                    {pr.location && <Editable value={pr.location} onBlur={v => onPatch('location', v)}
                        style={{ color: '#ccc', fontSize: 10, marginTop: 2, display: 'block' }} />}
                </div>
                <div style={{ fontSize: 10, color: '#ddd', textAlign: 'right', lineHeight: 1.9 }}>
                    {pr.phone && <div><Editable value={pr.phone} onBlur={v => onPatch('phone', v)} style={{ color: '#ddd' }} /></div>}
                    {pr.email && <div><Editable value={pr.email} onBlur={v => onPatch('email', v)} style={{ color: '#ddd' }} /></div>}
                </div>
            </div>
            {/* Two-column body */}
            <div style={{ display: 'flex', padding: '12px 32px', gap: 32 }}>
                {/* Left: Statement + Experience */}
                <div style={{ flex: 2 }}>
                    {sectionOrder.includes('Summary') && pr.summary && (
                        <div>{heading('Statement')}
                            <Editable tag="div" value={hl(pr.summary)} onBlur={v => onPatch('summary', v)} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 11 }} />
                        </div>
                    )}
                    {sectionOrder.includes('Experience') && pr.experiences?.length && (
                        <div>{heading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 16 }}>
                                    <div style={{ fontWeight: 700, fontSize: 11.5 }}>
                                        <Editable value={`${exp.dates || ''} | ${exp.role || ''}`} onBlur={v => { const p = v.split(' | '); onPatch('expDates', p[0]?.trim() || '', i); onPatch('expRole', p[1]?.trim() || '', i); }} />
                                    </div>
                                    <Editable value={exp.company || ''} onBlur={v => onPatch('expCompany', v, i)} style={{ color: '#444', fontSize: 10.5, marginBottom: 4, display: 'block' }} />
                                    <Editable tag="div" value={hl(exp.summary || '')} onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, paddingLeft: 4 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Right: Education + Skills */}
                <div style={{ flex: 1, minWidth: 160 }}>
                    {sectionOrder.includes('Education') && pr.educations?.length && (
                        <div>{heading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 10.5 }}>{edu.graduationDate}</div>
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)} style={{ display: 'block' }} />
                                    <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                        style={{ fontWeight: 700, display: 'block' }} />
                                </div>
                            ))}
                        </div>
                    )}
                    {sectionOrder.includes('Skills') && pr.skills?.length && (
                        <div>{heading('Skills')}
                            {pr.skills.map((s, i) => <div key={i} style={{ fontSize: 10.5, marginBottom: 4 }}>{s}</div>)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Editorial (Giselle - serif name, period headings, mixed layout)
// ══════════════════════════════════════════════════════════════════════════════
const EditorialCanvas: React.FC<{
    pr: ParsedResumeDTO; font: string; edits: AppliedEdit[];
    heatmap: boolean; weaknesses: string; foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const heading = (label: string) => (
        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 14, color: '#1a2e1a', marginTop: 24, marginBottom: 10 }}>{label}.</div>
    );
    return (
        <div style={{ fontFamily: font, fontSize: 10.5, color: '#222', lineHeight: 1.7, background: '#fff', minHeight: '100%', padding: '40px 40px 40px 40px' }}>
            {/* Big serif name */}
            <Editable tag="h1" value={pr.fullName || 'Your Name'} onBlur={v => onPatch('fullName', v)}
                style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 700, margin: '0 0 4px', color: '#111' }} />
            <div style={{ borderTop: '2.5px solid #1a2e1a', borderBottom: '2.5px solid #1a2e1a', padding: '8px 0', display: 'flex', gap: 24, fontSize: 10, color: '#333', marginBottom: 16 }}>
                {sectionOrder.includes('Summary') && pr.summary && (
                    <Editable tag="div" value={hl(pr.summary)} onBlur={v => onPatch('summary', v)}
                        style={{ whiteSpace: 'pre-wrap', flex: 1, lineHeight: 1.6, maxWidth: '60%' }} />
                )}
            </div>
            {/* Two-col body */}
            <div style={{ display: 'flex', gap: 0 }}>
                {/* Left col */}
                <div style={{ flex: 1, paddingRight: 24, borderRight: '1.5px solid #1a2e1a' }}>
                    {heading('Contact')}
                    <div style={{ fontSize: 10, lineHeight: 2 }}>
                        {pr.phone && <div>● <Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></div>}
                        {pr.email && <div>● <Editable value={pr.email} onBlur={v => onPatch('email', v)} /></div>}
                        {pr.location && <div>● <Editable value={pr.location} onBlur={v => onPatch('location', v)} /></div>}
                    </div>
                    {sectionOrder.includes('Education') && pr.educations?.length && (
                        <div>{heading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 14 }}>
                                    <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)} style={{ display: 'block', fontSize: 10.5 }} />
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)} style={{ color: '#444', fontSize: 10, display: 'block' }} />
                                    <span style={{ fontSize: 9.5, color: '#666' }}>{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {sectionOrder.includes('Skills') && pr.skills?.length && (
                        <div>{heading('Achievements')}
                            {pr.skills.map((s, i) => <div key={i} style={{ fontSize: 10, marginBottom: 4 }}>{s}</div>)}
                        </div>
                    )}
                </div>
                {/* Right col */}
                <div style={{ flex: 2, paddingLeft: 24 }}>
                    {sectionOrder.includes('Experience') && pr.experiences?.length && (
                        <div>{heading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 20 }}>
                                    <Editable value={exp.role || ''} onBlur={v => onPatch('expRole', v, i)}
                                        style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 11.5, display: 'block' }} />
                                    <Editable value={exp.company || ''} onBlur={v => onPatch('expCompany', v, i)}
                                        style={{ color: '#444', fontSize: 10.5, display: 'block' }} />
                                    <span style={{ color: '#666', fontSize: 10 }}>{exp.dates}</span>
                                    <Editable tag="div" value={hl(exp.summary || '')} onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ whiteSpace: 'pre-wrap', marginTop: 6, lineHeight: 1.6, paddingLeft: 8, borderLeft: '1.5px solid #1a2e1a' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Olive Sidebar (Rahul v1 - cream left panel, gold accent headings)
// ══════════════════════════════════════════════════════════════════════════════
const OliveSidebarCanvas: React.FC<{
    pr: ParsedResumeDTO; font: string; edits: AppliedEdit[];
    heatmap: boolean; weaknesses: string; foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const gold = '#8B7535';
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const leftHeading = (label: string) => (
        <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#222', marginTop: 20, marginBottom: 8, borderBottom: '1.5px solid #ccc', paddingBottom: 4 }}>{label}</div>
    );
    const rightHeading = (label: string) => (
        <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: gold, marginTop: 20, marginBottom: 8 }}>{label}</div>
    );
    return (
        <div style={{ fontFamily: font, fontSize: 11, color: '#222', lineHeight: 1.6, background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Name header */}
            <div style={{ textAlign: 'center', padding: '32px 32px 16px', background: '#fff', borderBottom: '1px solid #eee' }}>
                <Editable tag="h1" value={pr.fullName || 'Your Name'} onBlur={v => onPatch('fullName', v)}
                    style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px', letterSpacing: 1, color: '#111', textTransform: 'uppercase' }} />
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#666' }}>Professional Resume</div>
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left cream sidebar */}
                <div style={{ width: 200, background: '#f5f0e8', padding: '20px 18px', flexShrink: 0, borderRight: '1px solid #e0d9ce' }}>
                    {leftHeading('Contact')}
                    <div style={{ fontSize: 10, lineHeight: 2 }}>
                        {pr.phone && <div>📞 <Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></div>}
                        {pr.email && <div>✉ <Editable value={pr.email} onBlur={v => onPatch('email', v)} /></div>}
                        {pr.location && <div>📍 <Editable value={pr.location} onBlur={v => onPatch('location', v)} /></div>}
                    </div>
                    {sectionOrder.includes('Education') && pr.educations?.length && (
                        <div>{leftHeading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ fontWeight: 700, fontSize: 10, color: gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>◆ <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)} /></div>
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)} style={{ fontSize: 10, color: '#555', display: 'block', marginTop: 2 }} />
                                    <span style={{ fontSize: 9, color: '#888' }}>{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {sectionOrder.includes('Skills') && pr.skills?.length && (
                        <div>{leftHeading('Skills')}
                            {pr.skills.map((s, i) => <div key={i} style={{ fontSize: 10.5, paddingLeft: 4, marginBottom: 4 }}>• {s}</div>)}
                        </div>
                    )}
                </div>
                {/* Right white content */}
                <div style={{ flex: 1, padding: '20px 28px' }}>
                    {sectionOrder.includes('Summary') && pr.summary && (
                        <div>{rightHeading('Summary')}
                            <Editable tag="div" value={hl(pr.summary)} onBlur={v => onPatch('summary', v)} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} />
                        </div>
                    )}
                    {sectionOrder.includes('Experience') && pr.experiences?.length && (
                        <div>{rightHeading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 18 }}>
                                    <div style={{ fontWeight: 700, fontSize: 11.5, color: gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        <Editable value={exp.role || ''} onBlur={v => onPatch('expRole', v, i)} />
                                    </div>
                                    <div style={{ fontSize: 10.5, color: '#555', marginBottom: 4 }}>
                                        <Editable value={exp.company || ''} onBlur={v => onPatch('expCompany', v, i)} />
                                        {exp.dates && <span style={{ marginLeft: 8, color: '#888' }}>{exp.dates}</span>}
                                    </div>
                                    <Editable tag="div" value={hl(exp.summary || '')} onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, paddingLeft: 8 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Orange Bold (Ankit - orange accent, bold headings, two-column)
// ══════════════════════════════════════════════════════════════════════════════
const OrangeBoldCanvas: React.FC<{
    pr: ParsedResumeDTO; font: string; edits: AppliedEdit[];
    heatmap: boolean; weaknesses: string; foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const orange = '#e85e00';
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const heading = (label: string) => (
        <div style={{ fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: orange, marginTop: 20, marginBottom: 10, fontFamily: 'Arial, sans-serif' }}>{label}</div>
    );
    return (
        <div style={{ fontFamily: font, fontSize: 11, color: '#222', lineHeight: 1.6, background: '#f5f5f5', minHeight: '100%' }}>
            {/* Bold header */}
            <div style={{ background: '#f5f5f5', padding: '36px 40px 20px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontWeight: 900, fontSize: 36, letterSpacing: -0.5, color: orange, lineHeight: 1, textTransform: 'uppercase' }}>
                    <Editable tag="div" value={pr.fullName || 'YOUR NAME'} onBlur={v => onPatch('fullName', v)} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginTop: 6 }}>Professional Resume</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#444', marginTop: 8 }}>
                    {pr.email && <span>✉ <Editable value={pr.email} onBlur={v => onPatch('email', v)} /></span>}
                    {pr.phone && <span>📞 <Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></span>}
                    {pr.location && <span>📍 <Editable value={pr.location} onBlur={v => onPatch('location', v)} /></span>}
                </div>
            </div>
            {/* Body */}
            <div style={{ display: 'flex', padding: '0 40px', gap: 32, background: '#f5f5f5' }}>
                {/* Left: Skills */}
                <div style={{ width: 200, flexShrink: 0 }}>
                    {sectionOrder.includes('Skills') && pr.skills?.length && (
                        <div>{heading('Skills')}
                            {pr.skills.map((s, i) => (
                                <div key={i} style={{ borderBottom: '1px solid #ddd', padding: '5px 0', fontSize: 10.5 }}>{s}</div>
                            ))}
                        </div>
                    )}
                    {sectionOrder.includes('Education') && pr.educations?.length && (
                        <div>{heading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)}
                                        style={{ fontWeight: 700, fontSize: 10.5, display: 'block' }} />
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)}
                                        style={{ color: '#555', fontSize: 10, display: 'block' }} />
                                    <span style={{ color: '#888', fontSize: 9.5 }}>{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Right: Summary + Experience */}
                <div style={{ flex: 1 }}>
                    {sectionOrder.includes('Summary') && pr.summary && (
                        <div>{heading('Summary')}
                            <Editable tag="div" value={hl(pr.summary)} onBlur={v => onPatch('summary', v)} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} />
                        </div>
                    )}
                    {sectionOrder.includes('Experience') && pr.experiences?.length && (
                        <div>{heading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 18 }}>
                                    <Editable value={exp.role || ''} onBlur={v => onPatch('expRole', v, i)}
                                        style={{ fontWeight: 800, fontSize: 11.5, color: orange, textTransform: 'uppercase', display: 'block', letterSpacing: 0.5 }} />
                                    <div style={{ fontSize: 10.5, color: '#555', marginBottom: 4 }}>
                                        <Editable value={exp.company || ''} onBlur={v => onPatch('expCompany', v, i)} />
                                        {exp.dates && <span style={{ marginLeft: 8, color: '#888' }}>{exp.dates}</span>}
                                    </div>
                                    <Editable tag="div" value={hl(exp.summary || '')} onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, borderLeft: `2px solid ${orange}`, paddingLeft: 10 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Template: Blue Professional (Rahul v2 - blue summary bar, sidebar)
// ══════════════════════════════════════════════════════════════════════════════
const BlueProCanvas: React.FC<{
    pr: ParsedResumeDTO; font: string; edits: AppliedEdit[];
    heatmap: boolean; weaknesses: string; foundKeywords: string;
    sectionOrder: string[];
    onPatch: (f: string, v: string, ei?: number, di?: number, sec?: string) => void;
    onPhraseClick?: (phrase: string) => void;
}> = ({ pr, font, edits, heatmap, weaknesses, foundKeywords, sectionOrder, onPatch, onPhraseClick }) => {
    const blue = '#1a56a0';
    const lightBlue = '#dbeafe';
    const hl = (t: string) => heatmap ? highlightAllPhrases(applyEdits(t, edits), weaknesses, foundKeywords, onPhraseClick) : applyEdits(t, edits);
    const leftHeading = (label: string) => (
        <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#333', marginTop: 18, marginBottom: 8 }}>{label}</div>
    );
    const rightHeading = (label: string) => (
        <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: blue, marginTop: 18, marginBottom: 8, borderBottom: '1px solid #bfdbfe', paddingBottom: 4 }}>{label}</div>
    );
    return (
        <div style={{ fontFamily: font, fontSize: 11, color: '#222', lineHeight: 1.6, background: '#fff', minHeight: '100%' }}>
            {/* Header top with name */}
            <div style={{ background: lightBlue, padding: '28px 32px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Editable tag="h1" value={pr.fullName || 'Your Name'} onBlur={v => onPatch('fullName', v)}
                        style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px', color: '#111', letterSpacing: 0.5, textTransform: 'uppercase' }} />
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#555' }}>Professional Resume</div>
                </div>
            </div>
            {/* Blue summary band */}
            {sectionOrder.includes('Summary') && pr.summary && (
                <div style={{ background: blue, color: '#fff', padding: '14px 32px' }}>
                    <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Summary</div>
                    <Editable tag="div" value={hl(pr.summary)} onBlur={v => onPatch('summary', v)}
                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 10.5, color: '#e0efff' }} />
                </div>
            )}
            {/* Body two-col */}
            <div style={{ display: 'flex' }}>
                {/* Left sidebar */}
                <div style={{ width: 200, background: lightBlue, padding: '16px 18px', flexShrink: 0 }}>
                    {leftHeading('Contact')}
                    <div style={{ fontSize: 10, lineHeight: 2 }}>
                        {pr.phone && <div>📞 <Editable value={pr.phone} onBlur={v => onPatch('phone', v)} /></div>}
                        {pr.email && <div>✉ <Editable value={pr.email} onBlur={v => onPatch('email', v)} /></div>}
                        {pr.location && <div>📍 <Editable value={pr.location} onBlur={v => onPatch('location', v)} /></div>}
                    </div>
                    {sectionOrder.includes('Education') && pr.educations?.length && (
                        <div>{leftHeading('Education')}
                            {pr.educations.map((edu: EducationDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ fontWeight: 700, fontSize: 10, color: blue, textTransform: 'uppercase' }}>◆ <Editable value={edu.degree || ''} onBlur={v => onPatch('eduDegree', v, undefined, i)} /></div>
                                    <Editable value={edu.institution || ''} onBlur={v => onPatch('eduInstitution', v, undefined, i)} style={{ fontSize: 10, color: '#333', display: 'block', marginTop: 2 }} />
                                    <span style={{ fontSize: 9.5, color: '#666' }}>{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {sectionOrder.includes('Skills') && pr.skills?.length && (
                        <div>{leftHeading('Skills')}
                            {pr.skills.map((s, i) => <div key={i} style={{ fontSize: 10.5, marginBottom: 4 }}>• {s}</div>)}
                        </div>
                    )}
                </div>
                {/* Right content */}
                <div style={{ flex: 1, padding: '16px 28px' }}>
                    {sectionOrder.includes('Experience') && pr.experiences?.length && (
                        <div>{rightHeading('Experience')}
                            {pr.experiences.map((exp: ExperienceDTO, i: number) => (
                                <div key={i} style={{ marginBottom: 18 }}>
                                    <div style={{ fontWeight: 700, fontSize: 12, color: blue, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        <Editable value={exp.role || ''} onBlur={v => onPatch('expRole', v, i)} />
                                    </div>
                                    <div style={{ fontSize: 10.5, color: '#555', marginBottom: 4 }}>
                                        <Editable value={exp.company || ''} onBlur={v => onPatch('expCompany', v, i)} />
                                        {exp.dates && <span style={{ marginLeft: 8, color: '#888' }}>{exp.dates}</span>}
                                    </div>
                                    <Editable tag="div" value={hl(exp.summary || '')} onBlur={v => onPatch('expSummary', v, i)}
                                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
        if (!resumeId || resumeId === 0) return; // Do not patch the dummy sample resume

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
                }}>ElevateAI</div>
            )}

            {/* Canvas hint */}
            <div className="absolute top-3 right-3 z-10 text-[10px] font-bold text-slate-400 bg-white/80 border border-slate-200 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Click any field to edit
            </div>

            <div className="relative z-[1]" style={{ pointerEvents: 'auto' }}
                 onClick={(e) => {
                     const target = e.target as HTMLElement;
                     if (target && target.dataset && target.dataset.phrase) {
                         onPhraseClick?.(target.dataset.phrase);
                     }
                 }}
            >
                {template === 'basic' && <ClassicCanvas {...commonProps} />}
                {template === 'modern' && <ModernCanvas {...commonProps} />}
                {template === 'executive' && <ExecutiveCanvas {...commonProps} />}
                {template === 'tech-focused' && <TechFocusedCanvas {...commonProps} />}
                {template === 'minimalist' && <MinimalistCanvas {...commonProps} />}
                {template === 'bold-bw' && <BoldBwCanvas {...commonProps} />}
                {template === 'editorial' && <EditorialCanvas {...commonProps} />}
                {template === 'olive-sidebar' && <OliveSidebarCanvas {...commonProps} />}
                {template === 'orange-bold' && <OrangeBoldCanvas {...commonProps} />}
                {template === 'blue-pro' && <BlueProCanvas {...commonProps} />}
            </div>
        </div>
    );
};
