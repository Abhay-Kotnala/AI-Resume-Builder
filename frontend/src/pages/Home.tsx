import React, { useState } from 'react';
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

export const Home: React.FC = () => {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

    const handleAnalysisComplete = (result: AnalysisResponse) => {
        setAnalysisResult(result);
    };

    return (
        <>
            {/* Hero Section */}
            {!analysisResult ? (
                <section className="relative overflow-hidden bg-slate-50/50 pt-16 pb-24 lg:pt-24 lg:pb-32">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                            {/* Left Column: Text Content */}
                            <div className="lg:col-span-5 text-center lg:text-left mb-16 lg:mb-0">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    Free ATS Resume Checker
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                                    Is your resume <span className="text-emerald-500">good enough?</span>
                                </h1>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    Our free and fast resume checker analyzes your resume against top ATS algorithms and provides actionable feedback within seconds.
                                </p>

                                {/* Trust Badge */}
                                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-10 justify-center lg:justify-start">
                                    <div className="flex -space-x-3">
                                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=33" alt="User" />
                                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=47" alt="User" />
                                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=12" alt="User" />
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+10k</div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-400">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-0.5"><span className="font-bold text-slate-800">4.9/5</span> from 10,000+ reviews</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button onClick={() => document.getElementById('resume-upload-input')?.click()} className="px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all text-lg cursor-pointer">
                                        Upload Your Resume
                                    </button>
                                    <button onClick={() => setAnalysisResult({
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
                                        missingKeywords: 'Docker, AWS, GraphQL'
                                    })} className="px-8 py-3.5 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-lg cursor-pointer">
                                        View Sample Report
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Interactive App / Result */}
                            <div className="lg:col-span-7 relative">
                                <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="relative bg-slate-50/50 pt-10 pb-24">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-fade-in-up w-full">
                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="mb-6 group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-sm font-bold rounded-xl text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 focus:outline-none"
                            >
                                <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span> Check Another Resume
                            </button>
                            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
                                <AtsDashboard result={analysisResult} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            <TestimonialsSlider />

            {/* Interactive How It Works Section */}
            <div id="how-it-works">
                <HowItWorks />
            </div>

            {/* Before & After Comparison Section */}
            <div id="features">
                <BeforeAfterComparison />

                {/* Analyzer Mockup Section */}
                <AnalyzerMockup />
            </div>

            {/* Resources Grid Section */}
            <ResourcesGrid />

            {/* Resume Optimization Checklist Section */}
            <ChecklistSection />

            {/* FAQ Section */}
            <FAQSection />
        </>
    );
};
