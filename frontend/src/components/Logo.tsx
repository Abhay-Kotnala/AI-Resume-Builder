import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <img
        src="/logo.png"
        alt="ElevateAI Logo"
        className={`${className} object-contain rounded-xl`}
    />
);
