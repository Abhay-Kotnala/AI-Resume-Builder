import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { API_BASE_URL } from '../services/api';


export const Checkout: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Instead of a fake form, we immediately generate a Stripe session when they click "Checkout"
    const handleStripeCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Call our new Spring Boot endpoint
            const response = await fetch(`${API_BASE_URL.replace('/resume', '/stripe')}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const session = await response.json();

            if (!response.ok) {
                throw new Error(session.error || 'Failed to initialize checkout');
            }

            // Redirect the user to the secure Stripe Hosted Checkout page
            if (session.url) {
                window.location.href = session.url;
            } else {
                throw new Error('No checkout URL returned from server.');
            }

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Something went wrong connecting to Stripe.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-emerald-200">
            <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row">

                {/* Left Side: Summary Panel */}
                <div className="md:w-1/2 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 w-full mb-12">
                        <Link to="/" className="inline-block opacity-90 hover:opacity-100 transition-opacity">
                            <Logo />
                        </Link>
                    </div>

                    <div className="relative z-10 w-full mb-12">
                        <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase mb-2 block">Subscription</span>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">ElevateAI Premium</h1>
                        <p className="text-slate-400">Interview-generating AI for serious job seekers.</p>

                        <div className="flex items-end gap-2 mt-6 border-b border-slate-800 pb-8">
                            <span className="text-5xl font-extrabold text-white">$19</span>
                            <span className="text-slate-400 text-lg mb-1">/ month</span>
                        </div>
                    </div>

                    <div className="relative z-10 w-full flex items-center gap-4 text-slate-500 text-sm">
                        <span>Powered by</span>
                        <strong className="text-slate-400">⚡ Stripe</strong>
                    </div>
                </div>

                {/* Right Side: Redirect Interstitial */}
                <div className="md:w-1/2 p-10 flex flex-col items-center justify-center text-center">

                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-inner">
                        <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Checkout</h2>
                    <p className="text-slate-600 mb-8 max-w-sm">
                        You will be securely redirected to Stripe to complete your payment. ElevateAI does not store your credit card information.
                    </p>

                    {error && (
                        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 w-full text-sm border border-rose-200">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <button
                        onClick={handleStripeCheckout}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isProcessing
                            ? 'bg-indigo-400 cursor-not-allowed text-white shadow-none transform-none'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-xl shadow-indigo-600/20 text-white'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Connecting to Stripe...
                            </>
                        ) : (
                            <>
                                Proceed to Payment
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </>
                        )}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                        <span className="text-xs font-medium">SSL Encrypted Transaction</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
