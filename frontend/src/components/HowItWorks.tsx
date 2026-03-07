import React, { useState } from 'react';

const steps = [
    {
        id: 'upload',
        title: 'Upload Your Resume',
        description: 'Start by securely uploading your existing resume in PDF format. Our system accepts standard formats and instantly begins parsing the document structure.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        ),
        visual: (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden group">
                {/* Miniature Realistic Resume */}
                <div className="w-48 h-64 bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 p-4 transform transition-transform group-hover:-translate-y-2 relative z-10 flex flex-col gap-2 overflow-hidden">
                    {/* Header */}
                    <div className="text-center border-b border-slate-100 pb-2 mb-1">
                        <div className="h-2 w-16 bg-slate-800 rounded mx-auto mb-1"></div>
                        <div className="h-1 w-24 bg-slate-400 rounded mx-auto"></div>
                    </div>
                    {/* Body */}
                    <div className="space-y-3">
                        <div>
                            <div className="h-1 w-12 bg-emerald-500 rounded mb-1"></div>
                            <div className="h-1.5 w-full bg-slate-200 rounded mb-1"></div>
                            <div className="h-1.5 w-5/6 bg-slate-200 rounded mb-1"></div>
                            <div className="h-1.5 w-4/5 bg-slate-200 rounded"></div>
                        </div>
                        <div>
                            <div className="h-1 w-16 bg-emerald-500 rounded mb-1"></div>
                            <div className="h-1.5 w-full bg-slate-200 rounded mb-1"></div>
                            <div className="h-1.5 w-11/12 bg-slate-200 rounded mb-1"></div>
                        </div>
                    </div>
                    {/* Floating Upload Icon */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-400 rounded-full blur-[80px] opacity-20 z-0"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400 rounded-full blur-[60px] opacity-20 z-0"></div>
            </div>
        )
    },
    {
        id: 'tailor',
        title: 'Add Job Description',
        description: 'Optionally paste a target job description. ElevateAI will compare your resume against the specific keywords and requirements of the role.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        ),
        visual: (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden">
                <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden z-10 flex flex-col h-full max-h-64">
                    {/* Browser-like Header */}
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">linkedin.com/jobs/...</div>
                    </div>
                    {/* Job Description Content */}
                    <div className="p-5 overflow-hidden relative flex-1 text-left">
                        <div className="animate-fade-in-up">
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Senior Software Engineer</h4>
                            <p className="text-xs text-emerald-600 font-medium mb-4">TechCorp Inc. • San Francisco, CA</p>

                            <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">Requirements</h5>
                            <div className="space-y-2 mt-2">
                                <div className="flex gap-2 items-start opacity-70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                    <div className="h-2.5 w-full bg-slate-200 rounded"></div>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                                    <div className="text-[10px] text-slate-600 leading-tight">5+ years experience building highly scalable microservices with <span className="text-emerald-500 font-bold bg-emerald-50 px-1 rounded">Node.js</span> and <span className="text-emerald-500 font-bold bg-emerald-50 px-1 rounded">React</span>.</div>
                                </div>
                                <div className="flex gap-2 items-start opacity-70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                    <div className="h-2.5 w-4/5 bg-slate-200 rounded"></div>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                                    <div className="text-[10px] text-slate-600 leading-tight">Strong understanding of cloud infrastructure, specifically <span className="text-emerald-500 font-bold bg-emerald-50 px-1 rounded">AWS</span> and <span className="text-emerald-500 font-bold bg-emerald-50 px-1 rounded">Docker</span>.</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                </div>
                {/* Decorative background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-200 rounded-full blur-[80px] opacity-50 z-0"></div>
            </div>
        )
    },
    {
        id: 'analyze',
        title: 'AI Analysis',
        description: 'Our proprietary algorithm scans your resume simulating an Applicant Tracking System (ATS), identifying missing keywords, formatting errors, and weak bullet points.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        ),
        visual: (
            <div className="w-full h-full bg-emerald-500 flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
                <div className="relative z-10 w-48 h-48 rounded-full border-4 border-emerald-400 border-t-white animate-spin-slow flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    <div className="w-32 h-32 rounded-full border-4 border-emerald-300 border-b-white animate-spin-reverse flex items-center justify-center">
                        <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'report',
        title: 'Actionable Report',
        description: 'Receive an instant, comprehensive dashboard with your ATS score, prioritized improvements, and an AI re-writer to make your bullet points impactful and metric-driven.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        ),
        visual: (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden group text-left">
                <div className="w-full max-w-sm bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-5 z-10 grid grid-cols-2 flex-col gap-3 transform transition-transform group-hover:scale-[1.02]">
                    <div className="col-span-2 flex items-center justify-between border-b border-slate-700 pb-3 mb-1">
                        <div>
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]"></span>
                                Match Score
                            </div>
                            <div className="text-4xl font-black text-white flex items-baseline gap-1">85<span className="text-emerald-400 text-2xl">%</span></div>
                        </div>
                        {/* Donut Chart Mockup */}
                        <div className="relative w-14 h-14">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-emerald-500 animate-[dash_1s_ease-out_forwards]" strokeDasharray="85, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">85</div>
                        </div>
                    </div>
                    {/* Subscores */}
                    <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600/50">
                        <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Impact</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                <div className="w-[65%] h-full bg-amber-400"></div>
                            </div>
                            <span className="text-white text-xs font-bold">65%</span>
                        </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600/50">
                        <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Formatting</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                <div className="w-[90%] h-full bg-emerald-400"></div>
                            </div>
                            <span className="text-white text-xs font-bold">90%</span>
                        </div>
                    </div>
                    {/* Fixes Mockup */}
                    <div className="col-span-2 bg-rose-500/10 rounded-xl p-3 border border-rose-500/20 mt-1 flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <div className="text-rose-400 text-xs font-bold mb-0.5">3 Weak Bullet Points</div>
                            <div className="text-slate-300 text-[10px] leading-tight opacity-80">Click the magic wand to rewrite them with metrics.</div>
                        </div>
                    </div>
                </div>
                {/* Glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
            </div>
        )
    }
];

export const HowItWorks: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900 relative border-y border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-emerald-500 font-bold tracking-wider uppercase text-sm">The Process</h2>
                    <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        How ElevateAI <span className="text-slate-400 dark:text-slate-500">works</span>
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        We've streamlined the resume optimization process. In less than 30 seconds,
                        transform your resume from good to interview-ready.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                    {/* Left side: Interactive Tabs */}
                    <div className="lg:col-span-5 space-y-4">
                        {steps.map((step, index) => {
                            const isActive = index === activeStep;
                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setActiveStep(index)}
                                    className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 text-left relative overflow-hidden group
                                        ${isActive
                                            ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/30'
                                            : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl"></div>
                                    )}
                                    <div className="flex items-start gap-5">
                                        <div className={`mt-0.5 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300
                                            ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h4 className={`text-xl font-bold mb-2 transition-colors duration-300 
                                                ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                                                {step.title}
                                            </h4>
                                            {isActive && (
                                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm animate-fade-in-up">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right side: Dynamic Visuals */}
                    <div className="lg:col-span-7 relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {/* Tab Content Rendering */}
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`absolute inset-0 transition-all duration-500 ease-in-out
                                    ${index === activeStep ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 z-0 pointer-events-none'}`}
                            >
                                {step.visual}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
