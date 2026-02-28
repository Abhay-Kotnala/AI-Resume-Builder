import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';

interface Question {
    question: string;
    tip: string;
    category: 'Behavioural' | 'Technical' | 'Career';
}

interface Props {
    resumeId: number;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    Behavioural: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
    Technical: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400' },
    Career: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
};

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('elevateAI_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const InterviewCoach: React.FC<Props> = ({ resumeId }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [current, setCurrent] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setQuestions(null);
        setCurrent(0);
        setFlipped(false);
        try {
            const res = await fetch(`${API_BASE_URL}/${resumeId}/interview-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ jobDescription }),
            });
            if (!res.ok) throw new Error('Failed to generate questions');
            const data = await res.json();
            const parsed: Question[] = JSON.parse(data.questions);
            setQuestions(parsed);
        } catch (e: any) {
            setError(e.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const prev = () => { setFlipped(false); setTimeout(() => setCurrent(i => Math.max(0, i - 1)), 150); };
    const next = () => { setFlipped(false); setTimeout(() => setCurrent(i => Math.min((questions?.length ?? 1) - 1, i + 1)), 150); };

    const q = questions?.[current];
    const style = q ? (CATEGORY_STYLES[q.category] ?? CATEGORY_STYLES.Career) : null;

    return (
        <div className="bg-gradient-to-br from-violet-50 via-sky-50/50 to-white rounded-3xl p-6 border border-violet-100 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Mock Interview Coach</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">5 targeted questions drawn from your resume</p>
                </div>
            </div>

            {/* Job Description Input */}
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Target Role / Job Description <span className="font-normal text-slate-400 normal-case">(optional)</span>
            </label>
            <textarea
                rows={2}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description for hyper-targeted questions…"
                className="w-full rounded-2xl border border-violet-200 p-4 text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none bg-white shadow-sm text-slate-700 placeholder:text-slate-400 transition-all mb-4"
            />

            {error && (
                <div className="text-sm text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 mb-4">
                    {error}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating your questions…
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {questions ? 'Regenerate Questions' : 'Generate Interview Questions'}
                    </>
                )}
            </button>

            {/* Shimmer while loading */}
            {loading && (
                <div className="mt-5 space-y-3 animate-pulse">
                    <div className="h-32 bg-violet-100 rounded-2xl w-full"></div>
                    <div className="flex gap-2 justify-center">
                        {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-200" />)}
                    </div>
                </div>
            )}

            {/* Flashcard */}
            {questions && !loading && q && style && (
                <div className="mt-5">
                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setFlipped(false); setTimeout(() => setCurrent(i), 100); }}
                                className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2.5 bg-violet-500' : 'w-2.5 h-2.5 bg-violet-200 hover:bg-violet-300'}`}
                            />
                        ))}
                    </div>

                    {/* Card */}
                    <div
                        className="relative cursor-pointer select-none"
                        style={{ perspective: '1200px' }}
                        onClick={() => setFlipped(f => !f)}
                    >
                        <div
                            className="relative w-full transition-transform duration-500"
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                minHeight: '200px',
                            }}
                        >
                            {/* Front — Question */}
                            <div
                                className="absolute inset-0 bg-white rounded-2xl border-2 border-violet-100 shadow-lg p-6 flex flex-col"
                                style={{ backfaceVisibility: 'hidden' }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                        {q.category}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">{current + 1} / {questions.length}</span>
                                </div>
                                <p className="text-slate-800 font-semibold text-[15px] leading-relaxed flex-1">{q.question}</p>
                                <p className="text-xs text-slate-400 mt-4 text-center">Tap to reveal coaching tip →</p>
                            </div>

                            {/* Back — Coaching Tip */}
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-lg p-6 flex flex-col"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span className="text-violet-200 text-xs font-bold uppercase tracking-widest">Coaching Tip</span>
                                </div>
                                <p className="text-white font-medium text-[15px] leading-relaxed flex-1">{q.tip}</p>
                                <p className="text-violet-300 text-xs mt-4 text-center">← Tap to flip back</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav Buttons */}
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={prev}
                            disabled={current === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Previous
                        </button>
                        <span className="text-xs text-slate-400 font-medium">Flip card to see tip</span>
                        <button
                            onClick={next}
                            disabled={current === questions.length - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
