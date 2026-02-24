import React, { useState, useEffect } from 'react';

const testimonials = [
    {
        id: 1,
        quote: "ElevateAI's resume checker completely transformed my application. The AI suggested incredibly specific action verbs and quantified my achievements. I landed interviews at Google and Stripe within two weeks!",
        name: "Sarah Chen",
        role: "Software Engineer",
        company: "Google",
        image: "https://i.pravatar.cc/150?u=sarah",
        rating: 5
    },
    {
        id: 2,
        quote: "I was struggling to get past ATS filters for months. This tool instantly spotted that my PDF was exporting as an image, and helped me rewrite my summary. It's like having a FAANG Recruiter in your pocket.",
        name: "Marcus Johnson",
        role: "Product Manager",
        company: "Spotify",
        image: "https://i.pravatar.cc/150?u=marcus",
        rating: 5
    },
    {
        id: 3,
        quote: "The keyword matcher is a game-changer. I pasted the job description for a Senior Analyst role, and ElevateAI told me exactly which required skills I was missing. Got the offer last week!",
        name: "Elena Rodriguez",
        role: "Senior Data Analyst",
        company: "Netflix",
        image: "https://i.pravatar.cc/150?u=elena",
        rating: 5
    }
];

export const TestimonialsSlider: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const setSlide = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <section className="py-24 bg-white border-y border-slate-100 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-50 rounded-[100%] blur-[80px] opacity-60 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Trusted by professionals landing roles at
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-8 opacity-60 grayscale filter hover:grayscale-0 transition-all duration-500">
                        {/* Mock Company Logos (Text based for now) */}
                        <div className="text-2xl font-black text-slate-400">Google</div>
                        <div className="text-2xl font-black text-slate-400">Microsoft</div>
                        <div className="text-2xl font-black text-slate-400">Meta</div>
                        <div className="text-2xl font-black text-slate-400">Netflix</div>
                        <div className="text-2xl font-black text-slate-400">Spotify</div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto relative">

                    {/* Testimonial Cards */}
                    <div className="relative h-[280px] sm:h-[220px]">
                        {testimonials.map((testimonial, index) => {
                            const isActive = index === activeIndex;
                            const isPrev = index === (activeIndex - 1 + testimonials.length) % testimonials.length;

                            let transformClass = "opacity-0 translate-x-32 scale-95 z-0";
                            if (isActive) transformClass = "opacity-100 translate-x-0 scale-100 z-20 shadow-2xl shadow-emerald-100/50";
                            else if (isPrev) transformClass = "opacity-0 -translate-x-32 scale-95 z-0";

                            return (
                                <div
                                    key={testimonial.id}
                                    className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${transformClass}`}
                                >
                                    <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 text-center">
                                        <div className="flex justify-center gap-1 mb-6 text-amber-400">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                        <p className="text-xl md:text-2xl text-slate-700 font-medium italic mb-8 leading-relaxed">
                                            "{testimonial.quote}"
                                        </p>
                                        <div className="flex items-center justify-center gap-4">
                                            <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full border-2 border-emerald-100 object-cover" />
                                            <div className="text-left">
                                                <div className="font-extrabold text-slate-900">{testimonial.name}</div>
                                                <div className="text-emerald-600 font-medium text-sm">{testimonial.role} @ {testimonial.company}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center gap-3 mt-10">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-emerald-500 scale-125' : 'bg-slate-200 hover:bg-slate-300'}`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
