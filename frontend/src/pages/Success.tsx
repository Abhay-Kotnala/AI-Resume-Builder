import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { trackPurchaseCompleted } from '../services/analytics';

export const Success: React.FC = () => {

    useEffect(() => {
        // Track purchase immediately on page mount
        trackPurchaseCompleted();

        // Fire confetti animation lightly upon mounting the success page
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl rounded-full pointer-events-none"></div>

            <div className="max-w-xl w-full text-center relative z-10">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Welcome to Pro!
                </h1>

                <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-md mx-auto">
                    Your payment was successful. You now have unlimited access to ElevateAI's premium optimization suite.
                </p>

                <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl border border-slate-200 mb-10 text-left max-w-sm mx-auto">
                    <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">What's unlocked:</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-slate-700">
                            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Unlimited AI Rewrites
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Cover Letter Generator
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Advanced Keyword Gap Analysis
                        </li>
                    </ul>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold text-lg rounded-xl hover:bg-emerald-500 transition-colors shadow-xl hover:shadow-emerald-200"
                >
                    Start Optimizing Your Resume
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
            </div>
        </div>
    );
};
