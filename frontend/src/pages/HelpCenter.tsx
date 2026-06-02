import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { Link } from 'react-router-dom';

const GUIDES = [
    { title: "Software Engineer Resume Guide", icon: "💻", description: "How to highlight tech stacks, GitHub projects, and system design experience." },
    { title: "Product Manager Resume Guide", icon: "📊", description: "Focusing on impact, metrics, cross-functional leadership, and product launches." },
    { title: "Marketing Resume Guide", icon: "📈", description: "Showcasing campaign ROI, audience growth, and creative strategy." },
    { title: "Finance & Accounting Resume Guide", icon: "🏦", description: "Formatting financial models, audits, and cost-saving initiatives perfectly." },
];

const FAQS = [
    { q: "What is an ATS (Applicant Tracking System)?", a: "An ATS is software used by 99% of Fortune 500 companies to filter, sort, and rank resumes before a human ever sees them. If your resume isn't formatted correctly, the ATS might misread your experience and auto-reject you." },
    { q: "What are Action Verbs?", a: "Action verbs are strong words that start your bullet points (e.g., 'Spearheaded', 'Optimized', 'Architected'). They make your impact sound proactive and powerful compared to passive phrases like 'Responsible for'." },
    { q: "Does the resume format really matter?", a: "Yes. Complex multi-column formats, progress bars, and graphics confuse ATS parsers. A clean, single-column PDF format is the safest and most professional choice for 2026." },
    { q: "How does the AI Bullet Rewriter work?", a: "It takes your existing weak bullet point, analyzes it using NLP, and rewrites it to follow the 'Action + Context + Result' framework, ensuring it highlights quantifiable impact." }
];

export const HelpCenter: React.FC = () => {
    const heroRef = useInView();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <div className="bg-emerald-600 dark:bg-emerald-900 pt-24 pb-32 border-b border-emerald-700">
                <div ref={heroRef} className="max-w-4xl mx-auto px-4 text-center section-hidden">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Help Center & Resources
                    </h1>
                    <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
                        Everything you need to beat the ATS, write a perfect resume, and land your dream job.
                    </p>
                    <div className="relative max-w-xl mx-auto">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search guides, FAQs, action verbs..." 
                            className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-slate-900 font-medium"
                        />
                        <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-16 pb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* Main Content (Guides) */}
                    <div className="md:col-span-2 space-y-12">
                        {/* Resume Guides by Role */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                Resume Guides by Role
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {GUIDES.map((guide, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer group">
                                        <div className="text-3xl mb-3">{guide.icon}</div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{guide.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{guide.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs / Educational */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ATS Basics & FAQ
                            </h2>
                            <div className="space-y-6">
                                {FAQS.map((faq, i) => (
                                    <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{faq.q}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/50">
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">Top 100 Action Verbs</h3>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-4">Download our free cheat sheet of the 100 best verbs to use in your resume bullet points.</p>
                            <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors">Download PDF</button>
                        </div>
                        
                        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-white mb-2">Still need help?</h3>
                                <p className="text-sm text-slate-400 mb-6">Our support team is ready to assist you with any questions about your account or our AI tools.</p>
                                <Link to="/contact" className="inline-block w-full text-center py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-sm transition-colors">Contact Support</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
