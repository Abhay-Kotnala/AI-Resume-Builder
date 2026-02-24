import React, { useState, useRef, useEffect } from 'react';

export const MegaMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger Button */}
            <button className={`text-slate-600 font-medium transition-colors flex items-center gap-1 py-5 
                ${isOpen ? 'text-emerald-600' : 'hover:text-emerald-600'}`}>
                Features
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu Container */}
            <div
                className={`absolute top-full -left-24 w-[1000px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transform transition-all duration-300 origin-top
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible z-50' : 'opacity-0 scale-95 -translate-y-2 invisible -z-10'}`}
            >
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>

                <div className="grid grid-cols-12">

                    {/* Main Options */}
                    <div className="col-span-8 p-8 flex">

                        {/* Column 1 */}
                        <div className="flex-1 space-y-6">
                            <a href="#how-it-works" className="group flex items-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                                        AI Resume Checker <span className="text-emerald-500">&rarr;</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Scan and score your resume</p>
                                </div>
                            </a>

                            <a href="#" className="group flex items-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                        AI Builder <span className="text-blue-500">&rarr;</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Build from scratch with AI</p>
                                </div>
                            </a>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    Resume Examples
                                </div>
                                <ul className="space-y-3 pl-7">
                                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600">&bull; Software Engineer</a></li>
                                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600">&bull; Product Manager</a></li>
                                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600">&bull; Data Scientist</a></li>
                                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-emerald-600">&bull; Business Analyst</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="flex-1 space-y-6 pr-4">
                            <div>
                                <div className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    Resume Guides
                                </div>
                                <div className="space-y-5 pl-7">
                                    <a href="#" className="block group">
                                        <div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-600">Writing a Resume</div>
                                        <p className="text-xs text-slate-500 mt-1">The most comprehensive guide on writing.</p>
                                    </a>
                                    <a href="#" className="block group">
                                        <div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-600">Resume Summary</div>
                                        <p className="text-xs text-slate-500 mt-1">How to write a summary that gets attention.</p>
                                    </a>
                                    <a href="#" className="block group">
                                        <div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-600">Formats & Templates</div>
                                        <p className="text-xs text-slate-500 mt-1">Which format is best for your use case.</p>
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Promotional Column */}
                    <div className="col-span-4 bg-emerald-50 p-8 relative overflow-hidden flex flex-col items-start justify-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10 w-full">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">ATS-friendly resume builder</h3>
                            <p className="text-slate-600 text-sm mb-6">Build a stunning, tailored resume in minutes and double your interview chances.</p>

                            <button onClick={() => document.getElementById('resume-upload-input')?.click()} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all text-center">
                                Try ElevateAI Now
                            </button>

                            {/* Decorative mock resume */}
                            <div className="mt-8 bg-white p-3 rounded shadow-md w-full max-w-[200px] mx-auto opacity-90 rotate-2 hover:rotate-0 transition-transform duration-300">
                                <div className="w-1/2 h-2 bg-slate-800 rounded mb-2"></div>
                                <div className="w-1/3 h-1.5 bg-indigo-500 rounded mb-4"></div>
                                <div className="space-y-1.5 border-t border-slate-100 pt-2">
                                    <div className="w-3/4 h-1.5 bg-slate-200 rounded"></div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded"></div>
                                    <div className="w-5/6 h-1.5 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
