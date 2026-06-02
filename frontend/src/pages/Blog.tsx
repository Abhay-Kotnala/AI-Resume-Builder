import React from 'react';
import { useInView } from '../hooks/useInView';

const ARTICLES = [
    {
        title: "How to Beat the ATS in 2026",
        excerpt: "Applicant Tracking Systems have evolved. Here's exactly how the latest NLP parsers read your resume and how to format it perfectly.",
        category: "Resume Tips",
        date: "Oct 12, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "The Death of the Objective Statement",
        excerpt: "Why you should never use an objective statement again, and how to write a killer professional summary instead.",
        category: "Writing Advice",
        date: "Oct 8, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Action Verbs That Double Your Interview Rate",
        excerpt: "Stop saying 'responsible for'. We analyzed 10,000 successful resumes and found the 10 verbs that correlated highest with job offers.",
        category: "Data Study",
        date: "Oct 1, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "How to Answer 'Tell Me About Yourself'",
        excerpt: "The perfect framework for answering the most common (and most difficult) interview question without rambling.",
        category: "Interview Prep",
        date: "Sep 25, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Do Cover Letters Still Matter?",
        excerpt: "Our survey of 500 tech recruiters reveals the truth about whether anyone actually reads your cover letter.",
        category: "Career Strategy",
        date: "Sep 18, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=600&q=80"
    },
    {
        title: "Formatting Your Tech Stack the Right Way",
        excerpt: "Don't just list 50 technologies. Here's how to structure your skills section so it passes the ATS and impresses engineers.",
        category: "Resume Tips",
        date: "Sep 10, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
    }
];

export const Blog: React.FC = () => {
    const heroRef = useInView();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
            <div ref={heroRef} className="max-w-6xl mx-auto px-4 section-hidden">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Career Advice Blog</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Data-driven insights, resume strategies, and interview tips to help you land your next role.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ARTICLES.map((article, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer flex flex-col">
                            <div className="h-48 overflow-hidden relative">
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                                    {article.category}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                    {article.title}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
                                    {article.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <span>{article.date}</span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {article.readTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
