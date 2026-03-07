import React, { useEffect, useState } from 'react';

export const AnalyzerMockup: React.FC = () => {
    const [scanPosition, setScanPosition] = useState(0);
    const [activePopups, setActivePopups] = useState<number[]>([1]);

    // Animate the scan line
    useEffect(() => {
        const interval = setInterval(() => {
            setScanPosition((prev) => (prev >= 100 ? 0 : prev + 1));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // Randomly flash different mock popups
    useEffect(() => {
        const popupInterval = setInterval(() => {
            const randomCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 popups active
            const newPopups: number[] = [];
            while (newPopups.length < randomCount) {
                const r = Math.floor(Math.random() * 4) + 1;
                if (newPopups.indexOf(r) === -1) newPopups.push(r);
            }
            setActivePopups(newPopups);
        }, 2000);
        return () => clearInterval(popupInterval);
    }, []);

    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="lg:grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Animated Mockup */}
                    <div className="relative h-[500px] sm:h-[600px] mb-16 lg:mb-0 flex justify-center items-center">
                        {/* Inner Container to scale nicely */}
                        <div className="relative w-full max-w-[400px] aspect-[8.5/11] bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform rotate-2">

                            {/* Real-looking miniature resume content */}
                            <div className="flex flex-col gap-3 text-[7px] sm:text-[9px] text-slate-300 leading-normal font-sans opacity-80 overflow-hidden h-full">
                                <div className="text-center mb-1 pb-2 border-b-2 border-slate-100">
                                    <div className="text-sm font-extrabold text-slate-800 tracking-tight mb-1">JANE DOE</div>
                                    <div className="text-slate-500 font-medium">jane.doe@example.com | (555) 123-4567 | San Francisco, CA</div>
                                </div>

                                <div className="mt-1">
                                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-1 mb-2">Experience</div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-slate-800 font-bold">
                                                <span>Senior Software Engineer</span>
                                                <span className="text-slate-500">2020 - Present</span>
                                            </div>
                                            <div className="text-slate-500 font-medium italic mb-1">TechCorp Inc.</div>
                                            <ul className="list-disc pl-3 space-y-1 text-slate-600">
                                                <li>Architected scalable microservices using <span className="bg-emerald-100 text-emerald-700 font-bold px-1 rounded">Node.js</span> and <span className="bg-emerald-100 text-emerald-700 font-bold px-1 rounded">React</span>, serving 1M+ users.</li>
                                                <li>Led a team of 4 engineers to reduce DB query times by 40% using Redis caching.</li>
                                                <li className="bg-rose-50 text-rose-600 rounded px-1 -ml-1">Responsible for managing deployment pipelines and fixing server bugs daily.</li>
                                            </ul>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-slate-800 font-bold">
                                                <span>Software Developer</span>
                                                <span className="text-slate-500">2018 - 2020</span>
                                            </div>
                                            <div className="text-slate-500 font-medium italic mb-1">Startup X</div>
                                            <ul className="list-disc pl-3 space-y-1 text-slate-600">
                                                <li>Built the initial MVP of the flagship product leading to a $2M seed round.</li>
                                                <li className="bg-amber-50 text-amber-600 rounded px-1 -ml-1">Implemented new designs for the dashboard and created a new login flow.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-1 mb-2">Education</div>
                                    <div className="flex justify-between text-slate-800 font-bold">
                                        <span>University of California, Berkeley</span>
                                        <span className="text-slate-500">May 2018</span>
                                    </div>
                                    <div className="text-slate-600">B.S. Computer Science | GPA: 3.8/4.0</div>
                                </div>
                            </div>

                            {/* The Scan Line Overlay */}
                            <div
                                className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] z-20"
                                style={{ top: `${scanPosition}%` }}
                            >
                                <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-t from-emerald-500/20 to-transparent -translate-y-full pointer-events-none"></div>
                            </div>

                            {/* Popups Based on active state */}
                            <div className={`absolute top-[20%] -left-8 sm:-left-16 bg-white p-3 rounded-lg shadow-xl shadow-slate-900/20 border border-slate-100 flex items-center gap-3 transition-all duration-500 z-30 ${activePopups.includes(1) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Weak Action Verb</div>
                                    <div className="text-[10px] text-slate-500">Suggested: "Spearheaded"</div>
                                </div>
                            </div>

                            <div className={`absolute top-[45%] -right-8 sm:-right-16 bg-white p-3 rounded-lg shadow-xl shadow-slate-900/20 border border-slate-100 flex items-center gap-3 transition-all duration-500 z-30 ${activePopups.includes(2) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Keyword Match</div>
                                    <div className="text-[10px] text-slate-500">Found: React, Python</div>
                                </div>
                            </div>

                            <div className={`absolute top-[70%] -left-6 sm:-left-12 bg-white p-3 rounded-lg shadow-xl shadow-slate-900/20 border border-slate-100 flex items-center gap-3 transition-all duration-500 z-30 ${activePopups.includes(3) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Missing Metrics</div>
                                    <div className="text-[10px] text-slate-500">Quantify this bullet point.</div>
                                </div>
                            </div>

                            <div className={`absolute top-[85%] -right-4 sm:-right-10 bg-white p-3 rounded-lg shadow-xl shadow-slate-900/20 border border-slate-100 flex items-center gap-3 transition-all duration-500 z-30 ${activePopups.includes(4) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                                    <span className="font-bold text-xs">%</span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Formatting Check</div>
                                    <div className="text-[10px] text-slate-500">ATS parsing successful.</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right: Text content */}
                    <div className="text-center lg:text-left text-white">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                            Deep AI analysis <br />
                            <span className="text-emerald-400">in real-time.</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed mb-8">
                            Our proprietary engine doesn't just look for typos. It uses natural language processing to understand the context of your achievements, comparing them against the exact job description you are targeting.
                        </p>

                        <ul className="space-y-5 text-left mb-10 max-w-md mx-auto lg:mx-0">
                            <li className="flex items-start gap-4">
                                <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg shrink-0 mt-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <div>
                                    <strong className="block text-white mb-1">Semantic Keyword Matching</strong>
                                    <span className="text-slate-400 text-sm">Finds missing keywords using synonyms, ensuring you pass strict ATS filters.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg shrink-0 mt-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </span>
                                <div>
                                    <strong className="block text-white mb-1">Impact Quantification</strong>
                                    <span className="text-slate-400 text-sm">Flags bullet points that lack numbers and statistical impact showing your actual value.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg shrink-0 mt-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                                </span>
                                <div>
                                    <strong className="block text-white mb-1">Structural Parsing</strong>
                                    <span className="text-slate-400 text-sm">Tests if robotic ATS systems can accurately extract your Name, Dates, and Titles.</span>
                                </div>
                            </li>
                        </ul>

                        <button onClick={() => {
                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        }} className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm">
                            Learn How It Works
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};
