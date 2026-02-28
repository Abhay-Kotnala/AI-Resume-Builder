import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { MegaFooter } from './MegaFooter';
import { Logo } from './Logo';
import { SignInModal } from './SignInModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { trackLoginStarted } from '../services/analytics';

export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const { isAuthenticated, logout, user, isSignInModalOpen, openSignInModal, closeSignInModal } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const firstName = user?.name?.split(' ')[0] || '';

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        e.preventDefault();

        // If we are not on the homepage, navigate there first
        if (location.pathname !== '/') {
            navigate(`/${hash}`);
            setIsMobileMenuOpen(false);
            return;
        }

        // If we are already on the homepage, just smooth scroll
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-200">
            {/* Navbar */}
            <nav className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 cursor-pointer">
                            <Logo className="w-12 h-12" />
                        </Link>
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="/#features" onClick={(e) => handleNavClick(e, '#features')} className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer">Features</a>
                            <a href="/#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer">How it works</a>

                            {/* Tools Dropdown */}
                            <div className="relative group" onMouseEnter={() => setIsToolsOpen(true)} onMouseLeave={() => setIsToolsOpen(false)}>
                                <button className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer flex items-center gap-1">
                                    Tools
                                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isToolsOpen && (
                                    <div className="absolute top-full left-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 py-3 z-50 animate-fade-in-up">
                                        <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-slate-100 dark:border-slate-700 transform rotate-45"></div>
                                        <Link to="/" onClick={() => setIsToolsOpen(false)} className="relative flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            AI Resume Scanner
                                        </Link>
                                        <Link to="/dashboard" onClick={() => setIsToolsOpen(false)} className="relative flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                                            </div>
                                            Template Selector
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link to="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer">Pricing</Link>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Dark mode toggle */}
                            <button
                                onClick={toggleTheme}
                                aria-label="Toggle dark mode"
                                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isDark ? (
                                    // Sun icon
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    // Moon icon
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {!isAuthenticated ? (
                                <>
                                    <button onClick={() => { trackLoginStarted(); openSignInModal(); }} className="hidden md:block px-5 py-2 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">Sign in</button>
                                    <button onClick={() => document.getElementById('resume-upload-input')?.click()} className="px-3 sm:px-5 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all cursor-pointer text-sm sm:text-base">
                                        <span className="sm:hidden">Start Free</span>
                                        <span className="hidden sm:inline">Get Started</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/profile" className="hidden md:flex items-center gap-2.5 px-4 py-1.5 border border-slate-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer group">
                                        {user?.picture ? (
                                            <img src={user.picture} alt={firstName} className="w-7 h-7 rounded-full object-cover ring-2 ring-white" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {firstName[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-slate-700 group-hover:text-indigo-700 font-medium text-sm">{firstName}</span>
                                        <svg className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </Link>
                                    <button onClick={logout} className="hidden md:block px-4 py-2 text-slate-600 font-medium text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">Sign out</button>
                                </>
                            )}
                            {/* Mobile menu button */}
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                {isMobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 absolute top-16 left-0 w-full shadow-xl">
                            <div className="px-4 py-4 flex flex-col space-y-4">
                                <a href="/#features" onClick={(e) => handleNavClick(e, '#features')} className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400">Features</a>
                                <a href="/#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400">How it works</a>
                                <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400">Pricing</Link>
                                {!isAuthenticated && (
                                    <button onClick={() => { trackLoginStarted(); openSignInModal(); setIsMobileMenuOpen(false); }} className="text-left text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400">Sign in</button>
                                )}
                                {isAuthenticated && (
                                    <>
                                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400">Dashboard</Link>
                                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400">My Profile</Link>
                                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400">Sign out</button>
                                    </>
                                )}
                                {/* Dark mode toggle in mobile menu */}
                                <button onClick={toggleTheme} className="text-left text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                                    {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />

            {/* Main Content Area */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <MegaFooter />
        </div>
    );
};
