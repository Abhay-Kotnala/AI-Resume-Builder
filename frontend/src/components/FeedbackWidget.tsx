import React, { useState } from 'react';

export const FeedbackWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        if (!email.trim() || !message.trim()) {
            setError('Please provide an email and message');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095';
            const res = await fetch(`${apiUrl}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message, rating })
            });

            if (!res.ok) throw new Error('Failed to submit');

            setSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setSubmitted(false);
                setRating(0);
                setMessage('');
                setEmail('');
            }, 3000);

        } catch (err) {
            setError('Error submitting feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[9999] flex flex-col items-end">
            {/* Modal */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 p-5 animate-fade-in-up origin-bottom-right">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>💬</span> Feedback
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {submitted ? (
                        <div className="py-8 text-center animate-fade-in">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Thank you!</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your feedback helps us improve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Rating</label>
                                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="focus:outline-none transition-transform hover:scale-110"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                        >
                                            <svg
                                                className={`w-7 h-7 ${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'} transition-colors`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="What do you think of ElevateAI?"
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none dark:text-white"
                                />
                            </div>

                            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group border-4 border-white dark:border-slate-950 ${isOpen ? 'rotate-[-20deg] scale-90' : ''}`}
                title="Send Feedback"
            >
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                {isOpen ? (
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
            </button>
        </div>
    );
};
