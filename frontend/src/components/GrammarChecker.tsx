import React, { useState } from 'react';
import { checkGrammar, GrammarIssue } from '../services/api';
import { PaywallModal } from './PaywallModal';
import { trackUpgradeClicked } from '../services/analytics';

interface GrammarCheckerProps {
    resumeId: number;
    isPro: boolean;
    onFixPhrase: (phrase: string) => void;
}

export const GrammarChecker: React.FC<GrammarCheckerProps> = ({ resumeId, isPro, onFixPhrase }) => {
    const [issues, setIssues] = useState<GrammarIssue[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    const runCheck = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const foundIssues = await checkGrammar(resumeId);
            setIssues(foundIssues);
        } catch (err: any) {
            setError(err.message || 'Failed to run grammar check.');
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'cliche': return <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
            case 'passive': return <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
            case 'typo': return <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
            case 'vague': return <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
            default: return null;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'cliche': return 'Cliché';
            case 'passive': return 'Passive Voice';
            case 'typo': return 'Typo';
            case 'vague': return 'Vague Phrase';
            default: return 'Issue';
        }
    };

    const visibleIssues = isPro ? issues : issues?.slice(0, 3);
    const hasMoreIssues = !isPro && issues && issues.length > 3;

    return (
        <div className="flex flex-col h-full animate-fade-in divide-y divide-slate-100">
            <div className="p-6 shrink-0 bg-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Writing Checker</h2>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-6">Flag clich&eacute;s, passive voice, and weak verbs that get resumes rejected by human recruiters.</p>

                <button
                    onClick={runCheck}
                    disabled={isLoading}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Run Content Scan
                        </>
                    )}
                </button>
                {error && <p className="text-sm text-red-600 mt-3 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">{error}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
                {!issues && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 text-center px-4">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p className="font-medium text-sm">Run a scan to find hidden writing mistakes.</p>
                    </div>
                )}

                {issues && issues.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-emerald-600 gap-3 bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <p className="font-bold text-center">Your writing is sharp!</p>
                        <p className="text-sm text-emerald-600/70 text-center font-medium">No clichés, passive voice, or major issues found.</p>
                    </div>
                )}

                {issues && issues.length > 0 && (
                    <div className="space-y-4 pb-20">
                        {visibleIssues?.map((issue, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-indigo-500"></div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md text-xs font-bold text-slate-600">
                                        {getIcon(issue.type)}
                                        {getLabel(issue.type)}
                                    </div>
                                    <button
                                        onClick={() => onFixPhrase(issue.phrase)}
                                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-lg transition-colors border border-purple-100 flex items-center gap-1"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Fix with AI
                                    </button>
                                </div>
                                <div className="text-sm text-slate-800 font-medium mb-3 pl-1">
                                    "<span className="bg-red-100 text-red-800 px-1 rounded line-through decoration-red-400">{issue.phrase}</span>"
                                </div>
                                <div className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1.5">
                                    <span className="text-emerald-700 font-bold flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Suggestion:</span>
                                    {issue.suggestion}
                                </div>
                            </div>
                        ))}

                        {hasMoreIssues && (
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-3 border border-amber-500/30">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm1 16h-2v-2h2v2zm0-4h-2V8h2v6z" /></svg>
                                    </div>
                                    <h4 className="text-white font-bold mb-1">{issues.length - 3} more issues found</h4>
                                    <p className="text-slate-400 text-xs font-medium mb-4">You've reached the free limit. Upgrade to view and fix all writing mistakes.</p>
                                    <button
                                        onClick={() => {
                                            trackUpgradeClicked('grammar_checker_limit');
                                            setShowPaywall(true);
                                        }}
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 text-sm flex justify-center items-center gap-2"
                                    >
                                        Unlock All Suggestions
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
        </div>
    );
};
