import React from 'react';

export type BuilderTab = 'templates' | 'design' | 'ats' | 'addSection' | 'rearrange' | 'download';

interface BuilderSidebarProps {
    activeTab: BuilderTab;
    setActiveTab: (tab: BuilderTab) => void;
}

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: BuilderTab; label: string; icon: React.ReactNode }[] = [
        {
            id: 'addSection',
            label: 'Add Section',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            id: 'rearrange',
            label: 'Rearrange',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
            )
        },
        {
            id: 'templates',
            label: 'Templates',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: 'design',
            label: 'Design & Font',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            )
        },
        {
            id: 'ats',
            label: 'ATS Check',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },

        {
            id: 'download',
            label: 'Download',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            )
        }
    ];

    return (
        <div className="w-full lg:w-24 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-sm flex flex-row lg:flex-col items-center py-2 lg:py-6 h-auto lg:h-full z-40 shrink-0 overflow-x-auto lg:overflow-y-auto hide-scrollbar order-last lg:order-first">
            <div className="flex flex-row lg:flex-col gap-2 lg:gap-4 w-full px-2 lg:px-3 min-w-max lg:min-w-0">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                                }
                            `}
                        >
                            <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                                {tab.icon}
                            </div>
                            <span className={`text-[10px] font-bold text-center tracking-wide mt-1 lg:mt-0 ${isActive ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
