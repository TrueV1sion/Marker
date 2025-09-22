import React, { useState, useRef, useEffect } from 'react';
import { ChipIcon } from './icons/ChipIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface TechnologyFootprintProps {
    tech: string[];
}

const TechnologyFootprint: React.FC<TechnologyFootprintProps> = ({ tech }) => {
    const [activeTech, setActiveTech] = useState<{item: string, key: string} | null>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0, opacity: 0 });
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const techRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                const isTechButtonClick = Object.values(techRefs.current).some(ref => ref?.contains(event.target as Node));
                if (!isTechButtonClick) {
                    setActiveTech(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleTechClick = (techItem: string, uniqueKey: string, ref: HTMLButtonElement | null) => {
        if (activeTech?.key === uniqueKey) {
            setActiveTech(null);
            return;
        }

        if (ref) {
            const rect = ref.getBoundingClientRect();
            const popoverWidth = 288; // w-72
            let popoverLeft = rect.left + rect.width / 2 - popoverWidth / 2;
            
            // Adjust if it overflows the viewport
            if (popoverLeft < 16) popoverLeft = 16;
            if (popoverLeft + popoverWidth > window.innerWidth - 16) {
                popoverLeft = window.innerWidth - popoverWidth - 16;
            }

            setPopoverPosition({
                top: rect.bottom + window.scrollY + 8,
                left: popoverLeft + window.scrollX,
                opacity: 1
            });
            setActiveTech({item: techItem, key: uniqueKey});
        }
    };

    return (
        <div className="my-10">
            <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Technology Footprint</h3>
            <div className="flex flex-wrap gap-3">
                {tech.map((item, index) => {
                    const uniqueKey = `${item}-${index}`;
                    return (
                        <button
                            key={uniqueKey}
                            ref={(el) => { techRefs.current[uniqueKey] = el; }}
                            onClick={() => handleTechClick(item, uniqueKey, techRefs.current[uniqueKey])}
                            className={`flex items-center gap-2 bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${activeTech?.key === uniqueKey ? 'ring-2 ring-sky-500 bg-sky-100 text-sky-800' : ''}`}
                        >
                        <ChipIcon className="h-5 w-5 text-slate-500" />
                        <span>{item}</span>
                        </button>
                    );
                })}
            </div>

            {activeTech && (
                <div
                    ref={popoverRef}
                    className="fixed bg-white rounded-lg shadow-xl p-6 w-72 z-20 border border-slate-200 animate-fade-in-fast"
                    style={{
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        transition: 'opacity 0.2s',
                        opacity: popoverPosition.opacity
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="tech-popover-title"
                >
                    <button
                        onClick={() => setActiveTech(null)}
                        className="absolute top-2 right-2 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div>
                        <h4 id="tech-popover-title" className="font-bold text-lg text-slate-800 mb-2">{activeTech.item}</h4>
                        <p className="text-sm text-slate-600 mb-4">Click below to perform additional research on this technology.</p>
                        <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(activeTech.item)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full justify-center p-2 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
                            aria-label={`Google search for ${activeTech.item}`}
                            title={`Google search for ${activeTech.item}`}
                        >
                            <GoogleIcon className="h-5 w-5 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-700">Google Search</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnologyFootprint;