import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const MegaFooter: React.FC = () => {
    return (
        <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800 text-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

                    {/* Brand & Mission */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Logo className="w-8 h-8" />
                            <span className="font-bold text-xl tracking-tight text-white">ElevateAI</span>
                        </div>
                        <p className="text-slate-400 mb-8 max-w-sm leading-relaxed text-sm">
                            We're on a mission to democratize the job hunt. Using advanced NLP, we level the playing field so your resume gets the attention it deserves from modern ATS software.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                <span className="sr-only">GitHub</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Features Links */}
                    <div>
                        <h4 className="text-white font-bold mb-5 tracking-wide">Product</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">ATS Resume Checker</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">AI Bullet Point Writer</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Cover Letter Generator</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Resume Templates</Link></li>
                            <li><Link to="/pricing" className="hover:text-emerald-400 transition-colors w-max block">Pricing Options</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-bold mb-5 tracking-wide">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/article/1" className="hover:text-emerald-400 transition-colors w-max block">What is an ATS?</Link></li>
                            <li><Link to="/article/2" className="hover:text-emerald-400 transition-colors w-max block">Top 100 Action Verbs</Link></li>
                            <li><Link to="/article/3" className="hover:text-emerald-400 transition-colors w-max block">Resume Formats 2026</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Career Advice Blog</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Help Center & FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-bold mb-5 tracking-wide">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">About Us</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Contact Support</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Privacy Policy</Link></li>
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors w-max block">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Location */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-800 text-xs text-slate-500 font-medium">
                    <p>© 2026 ElevateAI. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        All systems operational
                    </div>
                </div>

            </div>
        </footer>
    );
};
