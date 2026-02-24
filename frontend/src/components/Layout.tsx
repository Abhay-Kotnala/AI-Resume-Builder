import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { MegaFooter } from './MegaFooter';
import { Logo } from './Logo';
import { SignInModal } from './SignInModal';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const { isAuthenticated, logout, user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || '';

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault();

        // If we are not on the homepage, navigate there first
        if (location.pathname !== '/') {
            navigate(`/${hash}`);
            return;
        }

        // If we are already on the homepage, just smooth scroll
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900 selection:bg-emerald-200">
            {/* Navbar */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 cursor-pointer">
                            <Logo className="w-8 h-8" />
                            <span className="font-bold text-xl tracking-tight text-slate-800">ElevateAI</span>
                        </Link>
                        <div className="hidden md:flex space-x-8">
                            <a href="/#features" onClick={(e) => handleNavClick(e, '#features')} className="text-slate-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">Features</a>
                            <a href="/#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="text-slate-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">How it works</a>
                            <Link to="/pricing" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">Pricing</Link>
                        </div>
                        <div className="flex gap-4">
                            {!isAuthenticated ? (
                                <>
                                    <button onClick={() => setIsSignInOpen(true)} className="hidden md:block px-5 py-2 text-slate-600 font-medium border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">Sign in</button>
                                    <button onClick={() => document.getElementById('resume-upload-input')?.click()} className="px-5 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all cursor-pointer">Get Started</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/dashboard" className="hidden md:flex items-center gap-2.5 px-4 py-1.5 border border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                                        {user?.picture ? (
                                            <img src={user.picture} alt={firstName} className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                                {firstName[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-slate-700 font-medium text-sm">{firstName}</span>
                                    </Link>
                                    <button onClick={logout} className="px-4 py-2 text-slate-600 font-medium text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">Sign out</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <MegaFooter />
        </div>
    );
};
