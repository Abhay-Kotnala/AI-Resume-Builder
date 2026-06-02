import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const Legal: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

    useEffect(() => {
        if (location.pathname === '/terms') {
            setActiveTab('terms');
        } else {
            setActiveTab('privacy');
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header & Tabs */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">Legal Information</h1>
                    <div className="inline-flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'terms' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Terms of Service
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm prose prose-slate dark:prose-invert max-w-none">
                    {activeTab === 'privacy' ? (
                        <>
                            <h2>Privacy Policy</h2>
                            <p>Last updated: October 2023</p>
                            <h3>1. Information We Collect</h3>
                            <p>When you use ElevateAI, we collect the resume files you upload, the text you input, and your basic account information (such as email and name) if you choose to create an account. We use this data strictly to provide the resume analysis service to you.</p>
                            
                            <h3>2. How We Use Your Data</h3>
                            <p>We use your data to grade your resume against our ATS simulator and to generate AI-powered bullet points. We do <strong>not</strong> sell your personal data to third parties, recruiters, or advertisers. Your data is processed securely via our cloud infrastructure.</p>

                            <h3>3. Data Retention and Deletion</h3>
                            <p>If you upload a resume as a guest, it is processed ephemerally and deleted from our servers shortly after analysis. If you are a logged-in user, we store your resumes in your account so you can access them later. You may request account deletion at any time, which will permanently erase all associated data.</p>

                            <h3>4. Third-Party Services</h3>
                            <p>We utilize trusted third-party providers (like Stripe for payments and OpenAI for AI generation). These providers have their own strict privacy standards and only receive the data necessary to perform their specific functions.</p>
                        </>
                    ) : (
                        <>
                            <h2>Terms of Service</h2>
                            <p>Last updated: October 2023</p>
                            
                            <h3>1. Acceptance of Terms</h3>
                            <p>By accessing or using ElevateAI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

                            <h3>2. Description of Service</h3>
                            <p>ElevateAI provides AI-powered resume analysis, bullet point generation, and related career tools. We do not guarantee that using our service will result in an interview, job offer, or specific career outcome.</p>

                            <h3>3. User Responsibilities</h3>
                            <p>You agree not to upload resumes or data that contain malicious code, inappropriate content, or falsified information. You are responsible for the accuracy of the resumes you generate.</p>

                            <h3>4. Intellectual Property</h3>
                            <p>The ElevateAI website, logo, original content, and underlying algorithms are the exclusive property of ElevateAI. The resume content you create belongs to you.</p>

                            <h3>5. Limitation of Liability</h3>
                            <p>ElevateAI is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the service or reliance on the generated content.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
