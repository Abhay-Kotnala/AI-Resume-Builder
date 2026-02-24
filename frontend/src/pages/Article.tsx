import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const Article: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Mock article data
    const article = {
        title: "How to Beat the ATS: The Ultimate Guide for 2026",
        category: "ATS Guide",
        date: "October 24, 2026",
        author: "Sarah Chen",
        authorRole: "Senior Tech Recruiter",
        image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1200",
        content: `
            <p class="mb-6">Applicant Tracking Systems (ATS) are the gatekeepers of modern hiring. Over 98% of Fortune 500 companies use them to parse, sort, and rank resumes before a human ever sets eyes on them. If your resume isn't optimized for these algorithms, you could be the most qualified candidate and still receive an automated rejection email within seconds.</p>
            
            <h3 class="text-2xl font-bold text-slate-900 mt-10 mb-4">1. The Truth About Keywords</h3>
            <p class="mb-6">Many candidates make the mistake of "keyword stuffing" – blindly pasting every skill from the job description in white text or listing them endlessly. Modern ATS software has evolved past this. They look for <strong>contextual keyword matching</strong>. This means you need to use the required skills naturally within your bullet points, connecting them to actual achievements.</p>
            <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl mb-8">
                <p class="text-emerald-900 font-medium"><strong>Pro Tip:</strong> Use the exact phrasing from the job description. If they ask for "Customer Relationship Management," don't just write "CRM" – use both to be safe.</p>
            </div>

            <h3 class="text-2xl font-bold text-slate-900 mt-10 mb-4">2. Formatting is Make or Break</h3>
            <p class="mb-6">The most beautiful, creatively designed resume is entirely useless if the ATS parses it into a jumbled mess of text. Avoid using:</p>
            <ul class="list-disc pl-6 space-y-2 mb-6 text-slate-700">
                <li>Multi-column layouts (ATS reads left-to-right, top-to-bottom)</li>
                <li>Complex tables or text boxes</li>
                <li>Headers and footers (often ignored by parsers)</li>
                <li>Unusual fonts or graphics</li>
            </ul>
            <p class="mb-6">Stick to a clean, single-column design with standard, clear headings like "Experience", "Education", and "Skills".</p>
        `
    };

    return (
        <article className="bg-white min-h-screen pb-24">
            {/* Header Image */}
            <div className="w-full h-[40vh] md:h-[50vh] relative">
                <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6 z-20">
                    <Link to="/" className="inline-flex items-center gap-2 text-white bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-lg font-medium hover:bg-slate-900/70 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 z-20">
                {/* Title Card */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {article.category}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">{article.date}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                        {article.title} {id && <span className="text-slate-300 text-lg ml-2">#{id}</span>}
                    </h1>

                    <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                        <img src="https://i.pravatar.cc/150?u=sarah" alt={article.author} className="w-12 h-12 rounded-full border border-slate-200" />
                        <div>
                            <div className="font-bold text-slate-900">{article.author}</div>
                            <div className="text-sm text-slate-500">{article.authorRole}</div>
                        </div>
                    </div>
                </div>

                {/* Article Prose Content */}
                <div
                    className="prose prose-lg prose-slate prose-headings:font-bold prose-a:text-indigo-600 max-w-none text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Call to action */}
                <div className="mt-16 bg-slate-900 rounded-2xl p-8 text-center sm:text-left sm:flex items-center justify-between gap-8">
                    <div>
                        <h4 className="text-2xl font-bold text-white mb-2">Ready to test your resume?</h4>
                        <p className="text-slate-400">See exactly how an ATS views your document, completely free.</p>
                    </div>
                    <Link to="/" className="mt-6 sm:mt-0 inline-block px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 shrink-0">
                        Scan My Resume
                    </Link>
                </div>
            </div>
        </article>
    );
};
