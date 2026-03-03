import React, { useState } from 'react';
import { tailorResume, ParsedResumeDTO } from '../services/api';
import { PaywallModal } from './PaywallModal';

interface JobTailorProps {
    resumeId: number;
    isPro: boolean;
    onTailored: (parsedResume: ParsedResumeDTO) => void;
}

export const JobTailor: React.FC<JobTailorProps> = ({ resumeId, isPro, onTailored }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [isTailoring, setIsTailoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    const handleTailor = async () => {
        if (!jobDescription || jobDescription.trim().length < 20) {
            setError("Please paste a meaningful job description (at least 20 characters).");
            return;
        }

        if (!isPro) {
            setShowPaywall(true);
            return;
        }

        setError(null);
        setIsTailoring(true);

        try {
            const updatedProfile = await tailorResume(resumeId, jobDescription);
            if (updatedProfile) {
                // Call parent callback, meaning the JobTailor was successful
                onTailored(updatedProfile);
                setJobDescription('');
            }
        } catch (err: any) {
            setError(err.message || "Failed to tailor resume. Please try again.");
        } finally {
            setIsTailoring(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <div className="px-6 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0 shadow-sm pt-[80px] pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">Job Tailor <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-2 uppercase font-black">Pro</span></h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Beat the ATS with targeted keywords</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0 relative p-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                Match The Role Perfectly
                                {isPro && <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Paste the job description below. ElevateAI will rewrite your summary and experience bullets to match the role's required skills and keywords.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Target Job Description
                    </label>
                    <div className="relative group">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => {
                                setJobDescription(e.target.value);
                                if (error) setError(null);
                            }}
                            className="w-full h-80 px-4 py-3 bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm placeholder:text-slate-400 group-hover:border-slate-300"
                            placeholder="Paste the full job description here... (e.g. 'We are looking for a Senior Product Manager who has experience with Agile, B2B SaaS, and cross-functional leadership...')"
                            disabled={isTailoring}
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleTailor}
                    disabled={isTailoring || !jobDescription}
                    className={`w-full py-3.5 px-4 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${isTailoring || !jobDescription
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                >
                    {isTailoring ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Tailoring Resume...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Auto-Tailor Resume
                        </>
                    )}
                </button>
            </div>

            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
        </div>
    );
};
