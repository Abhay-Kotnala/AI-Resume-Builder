import React, { useState } from 'react';
import { generateCoverLetter } from '../services/api';
import { trackCoverLetterGenerated } from '../services/analytics';

interface Props {
    resumeId: number;
}

const TONES = [
    { value: 'formal', label: '🎩 Formal', desc: 'Professional & structured' },
    { value: 'enthusiastic', label: '🚀 Enthusiastic', desc: 'Energetic & passionate' },
    { value: 'concise', label: '⚡ Concise', desc: 'Short & punchy' },
];

const LETTER_TYPES = [
    { value: 'application', label: 'Cold Application' },
    { value: 'followup', label: 'Following Up' },
    { value: 'referral', label: 'Referral Letter' },
];

export const CoverLetterGenerator: React.FC<Props> = ({ resumeId }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [tone, setTone] = useState('formal');
    const [letterType, setLetterType] = useState('application');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            // Build enriched job description prompt context
            const enrichedJD = [
                companyName ? `Company: ${companyName}` : '',
                recipientName ? `Hiring Manager: ${recipientName}` : '',
                `Tone: ${tone}`,
                `Type: ${letterType}`,
                jobDescription ? `\n${jobDescription}` : '',
            ].filter(Boolean).join('\n');

            const res = await generateCoverLetter(resumeId, enrichedJD);
            setResult(res.coverLetter);
            trackCoverLetterGenerated();
        } catch (err: any) {
            setError(err.message || 'Failed to generate cover letter.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadDocx = () => {
        if (!result) return;
        // Build a basic RTF document (opens cleanly in Word as .doc)
        const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;}
\\widowctrl\\hyphauto
\\pard\\f0\\fs24\\li720\\ri720\\sb120\\sa120
${result.replace(/\n/g, '\\par\n')}
}`;
        const blob = new Blob([rtfContent], { type: 'application/rtf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ElevateAI_Cover_Letter${companyName ? `_${companyName.replace(/\s+/g, '_')}` : ''}.rtf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadTxt = () => {
        if (!result) return;
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ElevateAI_Cover_Letter.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const wordCount = result ? result.split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-3xl p-6 border border-blue-100 dark:border-slate-700 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Cover Letter</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Tailored letter in seconds — built from your resume</p>
                </div>
            </div>

            {/* Tone Selector */}
            <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                    {TONES.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setTone(t.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-bold transition-all ${tone === t.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                                }`}
                        >
                            <span className="text-base">{t.label.split(' ')[0]}</span>
                            <span>{t.label.split(' ').slice(1).join(' ')}</span>
                            <span className="text-[10px] font-normal opacity-70">{t.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Letter Type */}
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Letter Type</label>
                <div className="flex gap-2 flex-wrap">
                    {LETTER_TYPES.map(lt => (
                        <button
                            key={lt.value}
                            onClick={() => setLetterType(lt.value)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${letterType === lt.value
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 bg-white dark:bg-slate-700'
                                }`}
                        >
                            {lt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recipient & Company fields */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="e.g. Google"
                        className="w-full rounded-xl border border-blue-200 dark:border-slate-600 p-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Hiring Manager</label>
                    <input
                        type="text"
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="e.g. Ms. Sarah Smith"
                        className="w-full rounded-xl border border-blue-200 dark:border-slate-600 p-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all"
                    />
                </div>
            </div>

            {/* Job Description */}
            <div className="relative mb-5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Job Description <span className="font-normal normal-case">(recommended)</span></label>
                <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job posting here for a perfectly tailored letter..."
                    className="w-full rounded-2xl border border-blue-200 dark:border-slate-600 p-4 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Writing your {tone} cover letter…
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {result ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                    </>
                )}
            </button>

            {/* Shimmer Skeleton */}
            {loading && (
                <div className="mt-5 space-y-3 animate-pulse">
                    <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded-full w-3/4"></div>
                    <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded-full w-5/6"></div>
                    <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded-full w-2/3"></div>
                    <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-4 bg-blue-100 dark:bg-slate-700 rounded-full w-4/5"></div>
                </div>
            )}

            {/* Result — styled like a letter */}
            {result && !loading && (
                <div className="mt-5 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-inner overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {tone} · {LETTER_TYPES.find(l => l.value === letterType)?.label}
                            </span>
                            <span className="text-xs text-slate-400">· {wordCount} words</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition-colors">
                                {copied ? (
                                    <><svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                                ) : (
                                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                                )}
                            </button>
                            <button onClick={handleDownloadDocx} title="Download as RTF (opens in Word)" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                .rtf
                            </button>
                            <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                .txt
                            </button>
                        </div>
                    </div>

                    {/* Letter preview with paper styling */}
                    <div className="relative px-8 py-6">
                        {/* Decorative envelope top line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <div className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap text-[14px] leading-[1.9] max-h-[480px] overflow-y-auto font-[Georgia,'Times_New_Roman',serif]">
                            {result}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
