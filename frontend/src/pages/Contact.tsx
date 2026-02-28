import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Contact: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // mailto fallback — opens the user's mail client pre-filled
        const mailto = `mailto:support@elevateai.app?subject=${encodeURIComponent(`[${form.subject}] ${form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
        window.location.href = mailto;
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-16 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-10 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">We'd love to hear from you</p>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Contact Support</h1>
                    <p className="text-slate-500">We typically respond within 24 hours on business days.</p>
                </div>

                {submitted ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-12 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-2xl font-black text-emerald-800 mb-2">Thanks for reaching out!</h2>
                        <p className="text-emerald-700 mb-6">Your mail client should have opened with your message pre-filled. We'll get back to you within 24 hours.</p>
                        <Link to="/" className="inline-flex px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">
                            Back to ElevateAI
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Name</label>
                                    <input
                                        name="name" required value={form.name} onChange={handleChange}
                                        placeholder="Your name"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none bg-slate-50 placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                                    <input
                                        name="email" type="email" required value={form.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none bg-slate-50 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                                <select
                                    name="subject" value={form.subject} onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none bg-slate-50"
                                >
                                    <option>General</option>
                                    <option>Billing & Subscription</option>
                                    <option>Technical Issue</option>
                                    <option>Feature Request</option>
                                    <option>Privacy / Data Request</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Message</label>
                                <textarea
                                    name="message" required rows={5} value={form.message} onChange={handleChange}
                                    placeholder="Describe your issue or question in as much detail as possible…"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-400 outline-none bg-slate-50 resize-none placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
                            >
                                Send Message →
                            </button>

                            <p className="text-xs text-center text-slate-400">
                                Or email us directly at{' '}
                                <a href="mailto:support@elevateai.app" className="text-indigo-500 hover:underline">support@elevateai.app</a>
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
