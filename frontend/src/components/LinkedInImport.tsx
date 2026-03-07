import React, { useState } from 'react';
import { importLinkedIn, ParsedResumeDTO } from '../services/api';
import { PaywallModal } from './PaywallModal';
import { useAuth } from '../context/AuthContext';

interface LinkedInImportProps {
    isOpen: boolean;
    onClose: () => void;
    resumeId: number;
    isPro: boolean;
    onImported: (parsedResume: ParsedResumeDTO) => void;
}

export const LinkedInImport: React.FC<LinkedInImportProps> = ({ isOpen, onClose, resumeId, isPro, onImported }) => {
    const [linkedInText, setLinkedInText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const { user } = useAuth();
    const activeIsPro = user?.isPro || isPro;

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!activeIsPro) {
            setShowPaywall(true);
            return;
        }

        if (!linkedInText.trim()) {
            setError("Please paste your LinkedIn profile text.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const updatedResume = await importLinkedIn(resumeId, linkedInText);
            onImported(updatedResume);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to import LinkedIn profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            Import from LinkedIn
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Paste your LinkedIn profile text or PDF export content to auto-fill your resume.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-6">
                    <textarea
                        className="w-full h-64 p-4 border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] resize-none font-sans text-sm outline-none"
                        placeholder="Paste your LinkedIn text here... (Ctrl+V or Cmd+V)&#10;&#10;E.g.,&#10;Software Engineer at Google&#10;Jan 2020 - Present&#10;- Built scalable microservices...&#10;&#10;Education:&#10;B.S. Computer Science, Stanford University"
                        value={linkedInText}
                        onChange={(e) => setLinkedInText(e.target.value)}
                        disabled={isLoading}
                    />
                    {error && (
                        <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 font-medium">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0A66C2]/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Extracting Data...
                            </>
                        ) : (
                            <>
                                Import Profile
                                {!activeIsPro && (
                                    <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
        </div>
    );
};
