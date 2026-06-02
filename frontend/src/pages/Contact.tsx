import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { Link } from 'react-router-dom';

export const Contact: React.FC = () => {
    const formRef = useInView();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setTimeout(() => setStatus('success'), 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
            <div ref={formRef} className="max-w-4xl mx-auto px-4 section-hidden">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Contact Support</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Have a question or need help with your account? We're here for you.</p>
                </div>

                <div className="grid md:grid-cols-5 gap-12">
                    {/* Form */}
                    <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">We'll get back to you within 24 hours.</p>
                                <button onClick={() => setStatus('idle')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                    <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                    <input required type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                                    <textarea required rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none" placeholder="How can we help you?" />
                                </div>
                                <button disabled={status === 'submitting'} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Email Us directly</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">For urgent technical support:</p>
                            <a href="mailto:support@elevateai.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">support@elevateai.com</a>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Business Inquiries</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">For partnerships and sales:</p>
                            <a href="mailto:partners@elevateai.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">partners@elevateai.com</a>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Check the FAQ
                            </h4>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">90% of questions are answered in our Help Center.</p>
                            <Link to="/help" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">Visit Help Center</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
