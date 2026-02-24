import React from 'react';
import { Logo } from './Logo';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleLinkedInLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/linkedin`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Animated Backdrop Blur */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Main Modal Container with floating animation */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-4 duration-500 border border-white/50">

                {/* Decorative Gradient Orbs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-white">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-pulse"></div>
                    <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="p-8 sm:p-10 relative">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-full transition-all duration-200 group"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50 transform transition-transform hover:scale-110 duration-300">
                            <Logo className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 mb-3">Welcome Back</h2>
                        <p className="text-slate-500 leading-relaxed max-w-[280px]">
                            Sign in to save your ATS-optimized resumes and unlock powerful AI features.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="group relative w-full flex items-center bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                        >
                            {/* Hover highlight effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                            <div className="absolute left-6 flex items-center justify-center z-10 w-6 h-6">
                                <svg className="w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <span className="z-10 flex-1 text-center">Continue with Google</span>
                        </button>

                        <button
                            onClick={handleLinkedInLogin}
                            className="group relative w-full flex items-center bg-[#0A66C2] text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-[#004182] transition-colors duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                            <div className="absolute left-6 flex items-center justify-center z-10 w-6 h-6">
                                <svg className="w-full h-full fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </div>
                            <span className="z-10 flex-1 text-center">Continue with LinkedIn</span>
                        </button>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="bg-slate-50/80 backdrop-blur-md p-5 border-t border-slate-100/50 text-center relative z-10">
                    <p className="text-xs text-slate-500 font-medium">
                        By continuing, you agree to our <a href="#" className="text-slate-700 hover:text-emerald-600 underline decoration-slate-300 hover:decoration-emerald-400 underline-offset-2 transition-all">Terms of Service</a> and <a href="#" className="text-slate-700 hover:text-emerald-600 underline decoration-slate-300 hover:decoration-emerald-400 underline-offset-2 transition-all">Privacy Policy</a>.
                    </p>
                </div>
            </div>

            {/* Custom Tailwind utilities for the shimmer effect */}
            <style>
                {`
                    @keyframes shimmer {
                        100% {
                            transform: translateX(100%);
                        }
                    }
                `}
            </style>
        </div>
    );
};
