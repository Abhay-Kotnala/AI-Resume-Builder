import React from 'react';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({ className = "h-8", showText = true }) => (
    <div className="flex items-center gap-2">
        <img
            src="/favicon.png"
            alt="Elevate AI Logo"
            className={`${className} object-contain`}
        />
        {showText && (
            <span className="text-xl font-bold tracking-tight text-slate-800">
                Elevate <span className="text-emerald-500">AI</span>
            </span>
        )}
    </div>
);
