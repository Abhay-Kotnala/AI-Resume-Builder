import React, { useState } from 'react';
import { uploadResume, analyzeResume, AnalysisResponse } from '../services/api';
import { trackResumeUploadStarted, trackResumeAnalyzed } from '../services/analytics';
import { useAuth } from '../context/AuthContext';
import { PaywallModal } from './PaywallModal';

interface ResumeUploadProps {
    onAnalysisComplete: (result: AnalysisResponse) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const { isAuthenticated, openSignInModal } = useAuth();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAuthenticated) {
            e.preventDefault();
            e.target.value = '';
            openSignInModal();
            return;
        }

        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            trackResumeUploadStarted();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!isAuthenticated) {
            openSignInModal();
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            trackResumeUploadStarted();
        }
    };

    const handleUploadAndAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const uploadResult = await uploadResume(file);
            const analysisResult = await analyzeResume(uploadResult.resumeId, jobDescription);
            trackResumeAnalyzed(analysisResult.atsScore, !!jobDescription.trim());
            onAnalysisComplete(analysisResult);
        } catch (err: any) {
            if (err.code === 'QuotaExceeded') {
                setIsPaywallOpen(true);
            } else {
                setError(err.message || 'Error processing resume');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>

            <div className="space-y-6">

                {/* Drag and Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative overflow-hidden group rounded-2xl p-10 text-center transition-all duration-300 ease-in-out border-2 border-dashed
                        ${isDragging ? 'scale-[1.01] border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'} bg-slate-50/50 dark:bg-slate-800/50`}
                >
                    <input
                        id="resume-upload-input"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="relative z-20 flex flex-col items-center justify-center gap-4 pointer-events-none">
                        {/* Circle Icon */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-sm
                            ${file ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-white dark:bg-slate-700 text-emerald-500 ring-1 ring-slate-200 dark:ring-slate-600'}`}>
                            {file ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-10 h-10 ml-0.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-3-3m3 3l3-3" />
                                </svg>
                            )}
                        </div>

                        {/* Upload Text Info */}
                        <div className="text-center space-y-1.5">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {file ? 'Resume Ready' : 'Drag & Drop Resume'}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm">
                                {file ? file.name : '(PDF files only - Max 5MB)'}
                            </p>
                            {!file && (
                                <div className="mt-4 inline-block px-5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-200 text-sm font-semibold pointer-events-none shadow-sm">
                                    {isAuthenticated ? 'Click to Browse Files' : 'Sign in to Upload'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Description Optional Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                        Target Job Description <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <textarea
                            rows={3}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here to tailor analysis..."
                            className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none pl-5 pr-16 text-[15px] leading-relaxed"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-600 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <button
                    onClick={handleUploadAndAnalyze}
                    disabled={!file || loading}
                    className={`relative w-full overflow-hidden py-4 px-6 rounded-2xl text-[17px] font-bold text-white transition-all duration-300 shadow-sm
                        ${!file || loading
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400'
                            : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing Resume...
                            </>
                        ) : 'Scan My Resume'}
                    </span>
                </button>

                {error && (
                    <div className="text-rose-600 text-sm p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-fade-in-up">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}
            </div>

            <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
        </div>
    );
};
