import React, { useState, useEffect } from 'react';
import { ResumeUpload } from '../components/ResumeUpload';
import { AtsDashboard } from '../components/AtsDashboard';
import { HowItWorks } from '../components/HowItWorks';
import { ChecklistSection } from '../components/ChecklistSection';
import { FAQSection } from '../components/FAQSection';
import { TestimonialsSlider } from '../components/TestimonialsSlider';
import { BeforeAfterComparison } from '../components/BeforeAfterComparison';
import { AnalyzerMockup } from '../components/AnalyzerMockup';
import { ResourcesGrid } from '../components/ResourcesGrid';
import { AnalysisResponse } from '../services/api';
import { useInView } from '../hooks/useInView';
import { useAuth } from '../context/AuthContext';

const STATS = [
    { value: '10,000+', label: 'Resumes analysed' },
    { value: '4.9 ★', label: 'Average rating' },
    { value: '< 2 min', label: 'Analysis time' },
    { value: '92%', label: 'Interview rate lift' },
];

const SAMPLE_RESULT: AnalysisResponse = {
    id: 0,
    resumeId: 0,
    atsScore: 85,
    impactScore: 65,
    brevityScore: 90,
    actionVerbScore: 70,
    summary: 'This is a strong resume tailored for a Software Engineer role. The experience section highlights key achievements effectively.',
    strengths: '• Strong use of action verbs\n• Clear contact information\n• Good educational background highlighted',
    weaknesses: '• Some bullet points lack quantifiable metrics\n• Missing a few key technical skills for modern web development',
    suggestedImprovements: '• Quantify your impact in the "Backend Developer" role (e.g., "Increased performance by X%").\n• Add skills like "Docker" and "Kubernetes" if applicable.',
    foundKeywords: 'React, Node.js, TypeScript, SQL',
    missingKeywords: 'Docker, AWS, GraphQL',
};

export const Home: React.FC = () => {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
    const [showStickyCta, setShowStickyCta] = useState(false);
    const { isAuthenticated, openSignInModal } = useAuth();

    const howItWorksRef = useInView();
    const featuresRef = useInView();
    const faqRef = useInView();

    useEffect(() => {
        const onScroll = () => setShowStickyCta(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleAnalysisComplete = (result: AnalysisResponse) => {
        setAnalysisResult(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Full-page analysis results view ──────────────────────────────────────
    if (analysisResult) {
        return (
            <div className="w-full animate-fade-in-up">
                {/* slim top bar with back button */}
                <div className="px-4 sm:px-6 lg:px-8 py-3 bg-slate-50 border-b border-slate-200">
                    <button
                        onClick={() => setAnalysisResult(null)}
                        className="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-sm font-bold rounded-xl text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 focus:outline-none"
                    >
                        <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                        Check Another Resume
                    </button>
                </div>
                {/* full-width dashboard — no wrapper constraints */}
                <AtsDashboard result={analysisResult} />
            </div>
        );
    }

    // ── Normal homepage ───────────────────────────────────────────────────────
    return (
        <>
            {/* ── Hero section ─────────────────────────────── */}
            <section className="relative overflow-hidden bg-slate-50/50 pt-16 pb-10 lg:pt-24 lg:pb-16">
                {/* Blob decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                        {/* Left column: headline + trust + CTAs */}
                        <div className="lg:col-span-5 text-center lg:text-left mb-16 lg:mb-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                Free ATS Resume Checker
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                                Is your resume <span className="text-emerald-500">good enough?</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Our free and fast resume checker analyzes your resume against top ATS
                                algorithms and provides actionable feedback within seconds.
                            </p>

                            {/* Trust avatars + rating */}
                            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-10 justify-center lg:justify-start">
                                <div className="flex -space-x-3">
                                    <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=33" alt="User" />
                                    <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=47" alt="User" />
                                    <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=12" alt="User" />
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+10k</div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-0.5">
                                        <span className="font-bold text-slate-800">4.9/5</span> from 10,000+ reviews
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated) openSignInModal();
                                        else document.getElementById('resume-upload-input')?.click();
                                    }}
                                    className="px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all text-lg cursor-pointer"
                                >
                                    Upload Your Resume
                                </button>
                                <button
                                    onClick={() => setAnalysisResult(SAMPLE_RESULT)}
                                    className="px-8 py-3.5 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-lg cursor-pointer"
                                >
                                    View Sample Report
                                </button>
                            </div>
                        </div>

                        {/* Right column: upload widget */}
                        <div className="lg:col-span-7 relative">
                            <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ticker strip ─────────────────────────────── */}
            <div className="bg-white border-y border-slate-100 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto px-4 text-center">
                    {STATS.map((s) => (
                        <div key={s.label}>
                            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Testimonials ────────────────────────────────────────── */}
            <TestimonialsSlider />

            {/* ── How It Works (scroll-in) ────────────────────────────── */}
            <div id="how-it-works" ref={howItWorksRef} className="section-hidden">
                <HowItWorks />
            </div>

            {/* ── Features (scroll-in) ────────────────────────────────── */}
            <div id="features" ref={featuresRef} className="section-hidden">
                <BeforeAfterComparison />
                <AnalyzerMockup />
            </div>

            {/* ── Resources ───────────────────────────────────────────── */}
            <ResourcesGrid />

            {/* ── Checklist ───────────────────────────────────────────── */}
            <ChecklistSection />

            {/* ── FAQ (scroll-in) ─────────────────────────────────────── */}
            <div ref={faqRef} className="section-hidden">
                <FAQSection />
            </div>

            {/* ── Sticky scroll CTA ───────────────────────────────────── */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${showStickyCta
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-3 px-4">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-white font-semibold text-sm sm:text-base">
                            🚀 Get your free ATS score in under 2 minutes
                        </p>
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                if (!isAuthenticated) {
                                    openSignInModal();
                                } else {
                                    setTimeout(() => document.getElementById('resume-upload-input')?.click(), 600);
                                }
                            }}
                            className="shrink-0 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/30"
                        >
                            Scan My Resume — It's Free →
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
