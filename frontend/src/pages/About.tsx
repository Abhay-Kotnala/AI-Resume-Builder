import React from 'react';
import { useInView } from '../hooks/useInView';

export const About: React.FC = () => {
    const heroRef = useInView();
    const missionRef = useInView();
    const teamRef = useInView();

    const team = [
        { name: "Alex Chen", role: "Founder & CEO", avatar: "https://i.pravatar.cc/150?img=11" },
        { name: "Sarah Jenkins", role: "Head of AI", avatar: "https://i.pravatar.cc/150?img=5" },
        { name: "Marcus Johnson", role: "Lead Engineer", avatar: "https://i.pravatar.cc/150?img=12" },
        { name: "Emily Rodriguez", role: "Product Designer", avatar: "https://i.pravatar.cc/150?img=9" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-20 pb-24">
                <div ref={heroRef} className="max-w-4xl mx-auto px-4 text-center section-hidden">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        Democratizing the job hunt.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        We believe that getting your dream job shouldn't depend on knowing the secret rules of applicant tracking systems. We're leveling the playing field for everyone.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-20">
                <div ref={missionRef} className="max-w-5xl mx-auto px-4 section-hidden">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Mission</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                Every year, millions of highly qualified candidates are automatically rejected by rigid software algorithms before a human ever sees their resume.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                ElevateAI was born out of frustration with this broken system. By harnessing the power of advanced Natural Language Processing, we reverse-engineer the ATS black box, empowering job seekers to build resumes that pass the machine test and impress the human reader.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">2M+</div>
                                <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Resumes Scanned</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">85%</div>
                                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Interview Success</div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-2">50k+</div>
                                <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Jobs Landed</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                                <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-2">24/7</div>
                                <div className="text-sm font-medium text-purple-800 dark:text-purple-300">AI Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-24">
                <div ref={teamRef} className="max-w-5xl mx-auto px-4 section-hidden text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Meet the Team</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
                        Built by a passionate team of engineers, recruiters, and designers who want to fix the hiring process.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {team.map((member, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mb-4 border-4 border-slate-50 dark:border-slate-800 shadow-sm" />
                                <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
