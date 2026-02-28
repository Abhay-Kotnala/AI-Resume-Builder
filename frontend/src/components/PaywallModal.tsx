import React from 'react';
import { useNavigate } from 'react-router-dom';
import { trackUpgradeClicked } from '../services/analytics';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        trackUpgradeClicked('paywall_modal');
        navigate('/pricing');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up border border-slate-100 overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute top-0 right-0 border-t-[60px] border-r-[60px] border-t-emerald-500 border-r-transparent"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-emerald-100 z-10 p-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex justify-center mb-6 relative z-10">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner mt-2">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                </div>

                <div className="text-center space-y-3 mb-8 relative z-10">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Free Limit Reached</h2>
                    <p className="text-slate-600 font-medium leading-relaxed">
                        You have used all your free AI resume scans. Upgrade to <span className="text-emerald-600 font-bold">ElevateAI Pro</span> to continue optimizing your career!
                    </p>
                </div>

                <ul className="space-y-3 mb-8">
                    {[
                        'Unlimited Resume AI Scans',
                        'Instant AI Cover Letters',
                        'Premium Resume Templates',
                    ].map((feature, i) => (
                        <li key={i} className="flex flex-row items-center gap-3 text-slate-700 font-medium">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>

                <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                    <button
                        onClick={handleUpgrade}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Unlock Unlimited Access
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};
