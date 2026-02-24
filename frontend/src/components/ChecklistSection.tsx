import React from 'react';

const checklistItems = [
    {
        title: 'Format',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        ),
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100',
        points: [
            'File format and size',
            'Resume length',
            'Long bullet points with suggestions on how to shorten'
        ]
    },
    {
        title: 'Resume sections',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        ),
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100',
        points: [
            'Contact information',
            'Essential sections',
            'Personality showcase with tips on how to improve'
        ]
    },
    {
        title: 'Content',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        ),
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100',
        points: [
            'ATS parse rate',
            'Repetition of words and phrases',
            'Spelling and grammar'
        ]
    },
    {
        title: 'Skills suggestion',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        ),
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100',
        points: [
            'Hard skills',
            'Missing skills based on job description'
        ]
    },
    {
        title: 'Style',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
        ),
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100',
        points: [
            'Resume design',
            'Email address professionalism'
        ]
    }
];

export const ChecklistSection: React.FC = () => {
    return (
        <section className="relative overflow-hidden bg-slate-900 pt-24 pb-32">
            {/* Dark premium background with swooping lines */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 opacity-90"></div>
                {/* Curved abstract lines */}
                <svg className="absolute top-0 right-0 w-full h-full opacity-20" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L1200 0 L1200 800 L0 800 Z" fill="none" />
                    <path d="M-200 200 C300 100 800 600 1400 300" stroke="#10b981" strokeWidth="2" fill="none" />
                    <path d="M-100 300 C400 200 700 700 1300 400" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
                    <path d="M0 400 C500 300 600 800 1200 500" stroke="#8b5cf6" strokeWidth="1" fill="none" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Our AI-powered resume checker goes beyond typos and punctuation
                    </h2>
                    <p className="text-xl text-slate-300 font-medium">
                        We've built-in proprietary AI algorithms to help you create a resume that's tailored directly to the position you're applying for.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* Left content area */}
                    <div className="lg:col-span-5 text-white sticky top-24">
                        <h3 className="text-3xl font-bold mb-6">Resume optimization checklist</h3>
                        <p className="text-slate-300 leading-relaxed text-lg mb-8">
                            We check for crucial things across 5 different categories on your resume including content, file type, and keywords in the most important sections of your resume. Here's a full list of the checks you'll receive:
                        </p>
                        <button onClick={() => document.getElementById('resume-upload-input')?.click()} className="px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-lg border border-emerald-400">
                            Check My Resume Now
                        </button>
                    </div>

                    {/* Right grid pattern of cards */}
                    <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 relative">
                        {checklistItems.map((item, index) => (
                            <div key={index} className={`bg-white rounded-2xl p-8 shadow-xl border border-slate-100 transition-transform duration-300 hover:-translate-y-1 ${index % 2 === 1 ? 'md:mt-12' : ''}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.bgColor} ${item.color}`}>
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-6">{item.title}</h4>
                                <ul className="space-y-4">
                                    {item.points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            <span className="text-slate-600 font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
