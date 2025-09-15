import React, { useState, useRef, useEffect } from 'react';
import { TeamMember } from '../types';
import { LinkedInIcon } from './icons/LinkedInIcon';

interface OrgChartProps {
    data: TeamMember[];
}

const OrgChart: React.FC<OrgChartProps> = ({ data }) => {
    const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0, opacity: 0 });
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const memberRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                // Check if the click was on one of the member buttons
                const isMemberButtonClick = Object.values(memberRefs.current).some(ref => ref?.contains(event.target as Node));
                if (!isMemberButtonClick) {
                    setActiveMember(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMemberClick = (member: TeamMember, ref: HTMLButtonElement | null) => {
        if (activeMember?.name === member.name) {
            setActiveMember(null);
            return;
        }

        if (ref) {
            const rect = ref.getBoundingClientRect();
            // Position popover below the button, centered
            const popoverLeft = rect.left + rect.width / 2 - 160; // 160 is half of popover width (320px)
            setPopoverPosition({
                top: rect.bottom + window.scrollY + 8,
                left: popoverLeft + window.scrollX,
                opacity: 1
            });
            setActiveMember(member);
        }
    };

    return (
        <div className="mb-10">
            <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Leadership Team at a Glance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.map((member) => (
                    <button
                        key={member.name}
                        // FIX: The ref callback should not return a value. Using a block body `{}` instead of an implicit return `()` fixes the TypeScript error.
                        ref={(el) => { memberRefs.current[member.name] = el; }}
                        onClick={() => handleMemberClick(member, memberRefs.current[member.name])}
                        className={`p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-left focus:outline-none focus:ring-2 focus:ring-sky-500 ${activeMember?.name === member.name ? 'ring-2 ring-sky-500' : 'border border-slate-200'}`}
                    >
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.title}</p>
                    </button>
                ))}
            </div>

            {activeMember && (
                <div
                    ref={popoverRef}
                    className="fixed bg-white rounded-lg shadow-xl p-6 w-80 z-20 border border-slate-200 animate-fade-in-fast"
                    style={{
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        transition: 'opacity 0.2s',
                        opacity: popoverPosition.opacity
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        onClick={() => setActiveMember(null)}
                        className="absolute top-2 right-2 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-start gap-4">
                        {activeMember.linkedin && (
                            <a
                                href={activeMember.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-sky-600 flex-shrink-0 mt-1"
                                aria-label={`LinkedIn profile for ${activeMember.name}`}
                            >
                                <LinkedInIcon className="h-6 w-6" />
                            </a>
                        )}
                        <div>
                            <h4 className="font-bold text-lg text-slate-800">{activeMember.name}</h4>
                            <p className="text-sm text-slate-500 mb-3">{activeMember.title}</p>
                            <p className="text-sm text-slate-600">{activeMember.bio}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgChart;