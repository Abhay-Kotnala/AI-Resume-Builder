import React, { useState } from 'react';

interface ResumeIssue {
    id: string;
    before: string;
    after: string;
    issue: string;
}

const issues: Record<string, ResumeIssue> = {
    'bullet1': {
        id: 'bullet1',
        before: "Responsible for leading the marketing team and running ad campaigns.",
        after: "Spearheaded a 12-person marketing team, executing data-driven ad campaigns that increased lead generation by 45% YoY.",
        issue: "Weak action verb & missing metrics."
    },
    'bullet2': {
        id: 'bullet2',
        before: "Helped launch a new product feature that users liked.",
        after: "Orchestrated the go-to-market strategy for the 'Pro Tier' feature, securing 10,000+ new active users within the first month.",
        issue: "Vague impact description."
    },
    'bullet3': {
        id: 'bullet3',
        before: "Managed the social media accounts.",
        after: "Optimized social media ad spend, reducing Customer Acquisition Cost (CAC) by 22% while maintaining steady conversion rates.",
        issue: "Lists tasks instead of achievements."
    },
    'skills': {
        id: 'skills',
        before: "Microsoft Word, Used Email",
        after: "Google Analytics (Advanced), HubSpot CRM",
        issue: "Outdated and basic skills."
    }
};

export const BeforeAfterComparison: React.FC = () => {
    const [fixedItems, setFixedItems] = useState<Record<string, boolean>>({});
    const [fixingItems, setFixingItems] = useState<Record<string, boolean>>({});

    const handleFix = (id: string, delay: number = 0) => {
        if (fixedItems[id] || fixingItems[id]) return;

        setTimeout(() => {
            setFixingItems(prev => ({ ...prev, [id]: true }));

            // Simulate AI processing time
            setTimeout(() => {
                setFixingItems(prev => ({ ...prev, [id]: false }));
                setFixedItems(prev => ({ ...prev, [id]: true }));
            }, 800 + Math.random() * 400); // 800-1200ms
        }, delay);
    };

    const handleFixAll = () => {
        const itemIds = Object.keys(issues);
        itemIds.forEach((id, index) => {
            handleFix(id, index * 300); // Stagger the fixes
        });
    };

    const handleReset = () => {
        setFixedItems({});
        setFixingItems({});
    };

    const allFixed = Object.keys(issues).every(id => fixedItems[id]);

    const renderItem = (id: string, isSkill: boolean = false) => {
        const item = issues[id];
        const isFixed = fixedItems[id];
        const isFixing = fixingItems[id];

        return (
            <div className={`relative group mb-5 ${isSkill ? 'inline' : 'flex flex-col sm:flex-row items-start sm:gap-4'}`}>
                <div className={`flex-1 transition-all duration-500 ${isSkill ? 'inline' : ''}`}>
                    {!isFixed ? (
                        <div className={`relative ${isSkill ? 'inline-block mx-1' : 'block'} ${isFixing ? 'animate-pulse text-indigo-600 bg-indigo-50 border-transparent rounded px-2 -mx-2' : 'bg-rose-50 text-rose-900 border-b-2 border-rose-300'}`}>
                            {isFixing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4 text-indigo-600 inline" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Optimizing with AI...
                                </span>
                            ) : item.before}

                            {/* Issue Tooltip */}
                            {!isFixing && !isSkill && (
                                <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs bg-slate-800 text-white text-xs font-medium p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                    <span className="text-rose-400 font-bold mr-1">Issue:</span>
                                    {item.issue}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`animate-fade-in-up ${isSkill ? 'inline-block mx-1 font-bold text-emerald-700' : 'bg-emerald-50/50 text-slate-800 border-l-4 border-emerald-500 pl-3 -ml-4 py-1.5'}`}>
                            {isSkill && <span className="text-emerald-500 mr-1">✓</span>}
                            {item.after}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {!isFixed && !isFixing && (
                    <button
                        onClick={() => handleFix(id)}
                        className={`shrink-0 text-xs font-bold rounded shadow-sm hover:shadow transition-all flex items-center gap-1.5 ${isSkill ? 'inline-flex align-middle ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'mt-2 sm:mt-0 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'}`}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Fix with AI
                    </button>
                )}
                {isFixed && !isSkill && (
                    <span className="shrink-0 text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2 sm:mt-0 sm:py-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Optimized
                    </span>
                )}
            </div>
        );
    };

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-100 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 text-indigo-700 text-sm font-semibold mb-6 border border-indigo-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 w-[200%] animate-[shimmer_2s_infinite] -translate-x-full"></div>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Interactive Mockup
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                        Stop getting rejected by <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">invisible algorithms.</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        Experience the power of ElevateAI. Click "Fix with AI" to see how our engine transforms weak bullet points into interview-generating achievements.
                    </p>

                    {/* Global Controls */}
                    <div className="flex justify-center gap-4">
                        {!allFixed ? (
                            <button
                                onClick={handleFixAll}
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-indigo-200"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                Auto-Fix All Issues
                            </button>
                        ) : (
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Reset Demo
                            </button>
                        )}
                    </div>
                </div>

                {/* Resume Mockup Display */}
                <div className="max-w-4xl mx-auto relative perspective-1000">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full p-6 sm:p-10 md:p-14 relative overflow-hidden transition-all duration-500">
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out"
                                style={{ width: `${(Object.values(fixedItems).filter(Boolean).length / Object.keys(issues).length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Header Section */}
                        <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center pt-4">
                            <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">Alex Morgan</h3>
                            <p className="text-slate-600 text-sm sm:text-base font-medium">San Francisco, CA • alex.morgan@email.com • (555) 123-4567 • linkedin.com/in/alexmorgan</p>
                        </div>

                        {/* Experience Section */}
                        <div className="mb-10">
                            <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-6 text-left">Professional Experience</h4>

                            <div className="mb-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-4 gap-1 sm:gap-0">
                                    <h5 className="font-bold text-slate-800 text-lg">Senior Marketing Manager | InnovateTech</h5>
                                    <span className="text-slate-500 text-sm font-medium">Jan 2021 - Present</span>
                                </div>

                                <div className="space-y-2 mt-4 text-slate-700 text-base">
                                    {renderItem('bullet1')}
                                    {renderItem('bullet2')}
                                    {renderItem('bullet3')}
                                </div>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="pb-8">
                            <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-6 text-left">Core Competencies</h4>
                            <div className="text-base text-slate-700 leading-relaxed text-left">
                                <span className="font-bold text-slate-800 mr-2">Skills: </span>
                                Digital Marketing, SEO, Content Strategy,
                                {renderItem('skills', true)},
                                A/B Testing, Team Leadership.
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Accents */}
                    <div className="absolute top-1/2 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 translate-y-[-50%]"></div>
                    <div className="absolute top-1/2 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-y-[-30%]"></div>
                </div>

            </div>
        </section>
    );
};
