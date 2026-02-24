import React, { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What is a resume checker?",
        answer: "A resume checker is a tool or software used to evaluate and improve resumes. It checks for proper formatting, relevant keywords (important for Applicant Tracking Systems), grammar and spelling errors, and content relevance. ElevateAI's resume checker also assesses consistency in details, suggests customization for different industries, and provides feedback for improvement. We help ensure your resume meets current professional standards and trends and increase your chances of getting noticed by employers and recruiters."
    },
    {
        question: "How do I check my resume score?",
        answer: "Simply upload your resume in PDF format to our platform. ElevateAI will instantly simulate an Applicant Tracking System scan and assign you a score out of 100 based on your format, keyword match, and content quality."
    },
    {
        question: "How do I improve my resume score?",
        answer: "To improve your score, follow the actionable insights provided in your ElevateAI report. Focus on quantifying your achievements, fixing formatting errors, and incorporating the suggested missing keywords from your target job description."
    },
    {
        question: "How do I know my resume is ATS compliant?",
        answer: "An ATS-compliant resume uses standard formatting, clear section headings, and a single-column layout without complex tables or graphics. Our checker specifically scans your resume for these structural elements to ensure readability by automated systems."
    },
    {
        question: "What is a good ATS score?",
        answer: "A score of 80% or higher is generally considered excellent and indicates your resume is highly optimized for Applicant Tracking Systems. Scores below 60% typically require significant revisions before applying."
    },
    {
        question: "Can an ATS read PDFs?",
        answer: "Most modern ATS platforms can read PDFs perfectly, and it is usually the preferred format because it preserves your document's layout and fonts. However, the PDF must be text-based (not an image or scan) for the ATS to parse it correctly."
    },
    {
        question: "How do I review my resume for errors?",
        answer: "While manual proofreading is essential, ElevateAI automatically scans for typos, passive voice, weak action verbs, and repetitive phrasing, giving you an objective and comprehensive review in seconds."
    },
    {
        question: "What should I focus on when checking my resume?",
        answer: "Focus first on clarity and impact. Ensure your most relevant experience is at the top, bullet points start with strong action verbs, and your contact information is easy to find. Tailoring your resume to match the specific job description is also critical."
    }
];

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="bg-white py-24 border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-medium text-slate-800 mb-10">
                    Frequently asked questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div key={index} className="border-b border-slate-100 pb-4">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between text-left py-2 group focus:outline-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200
                                            ${isOpen ? 'bg-indigo-500 text-white' : 'bg-indigo-500 text-white opacity-80 group-hover:opacity-100'}
                                        `}>
                                            {isOpen ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                            )}
                                        </div>
                                        <span className={`text-xl font-medium transition-colors duration-200
                                            ${isOpen ? 'text-indigo-500' : 'text-slate-700 group-hover:text-indigo-400'}
                                        `}>
                                            {faq.question}
                                        </span>
                                    </div>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out pl-9
                                        ${isOpen ? 'max-h-[500px] opacity-100 mt-4 mb-2' : 'max-h-0 opacity-0 my-0'}
                                    `}
                                >
                                    <p className="text-slate-600 leading-relaxed text-[15px]">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
