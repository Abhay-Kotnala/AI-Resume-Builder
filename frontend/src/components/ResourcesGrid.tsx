import React from 'react';
import { Link } from 'react-router-dom';

const resources = [
    {
        id: 1,
        title: "How to Beat the ATS: The Ultimate Guide for 2026",
        description: "Learn the exact algorithms Applicant Tracking Systems use to filter resumes, and how to format your document to guarantee a human reads it.",
        category: "ATS Guide",
        image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=800",
        readTime: "5 min read"
    },
    {
        id: 2,
        title: "The 100 Best Action Verbs for Tech Resumes",
        description: "Stop using 'Responsible for' and 'Managed'. Upgrade your bullet points with these high-impact action verbs organized by skill type.",
        category: "Action Verbs",
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800",
        readTime: "3 min read"
    },
    {
        id: 3,
        title: "Quantifying Your Impact When You Don't Have Numbers",
        description: "If you weren't tracking sales or direct revenue, how do you show ROI? Discover 5 frameworks for quantifying impact in any role.",
        category: "Metrics",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        readTime: "6 min read"
    }
];

export const ResourcesGrid: React.FC = () => {
    return (
        <section className="py-24 bg-slate-50 border-t border-slate-100 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
                            Further reading to level up your career.
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Expert advice on resume writing, passing the ATS, and negotiating your next offer.
                        </p>
                    </div>
                    <button className="hidden md:inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors group px-4 py-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
                        View all articles
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map((article) => (
                        <Link
                            key={article.id}
                            to={`/article/${article.id}`}
                            className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 sm:h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                        {article.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">
                                    {article.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm mb-6 flex-1">
                                    {article.description}
                                </p>

                                <div className="flex items-center justify-between text-sm font-medium text-slate-500 mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {article.readTime}
                                    </div>
                                    <span className="text-indigo-600 font-bold group-hover:underline decoration-2 underline-offset-4">
                                        Read more
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 text-center md:hidden">
                    <button className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors group px-6 py-3 rounded-xl bg-indigo-50 border border-indigo-100 w-full justify-center">
                        View all articles
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>

            </div>
        </section>
    );
};
