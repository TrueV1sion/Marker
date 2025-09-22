
import React, { useState } from 'react';
import { ModuleType } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { ProspectIcon } from './icons/ProspectIcon';
import { CompetitorIcon } from './icons/CompetitorIcon';
import { KnowledgeIcon } from './icons/KnowledgeIcon';
import { HeliosLogo } from './icons/HeliosLogo';
import { SWOTIcon } from './icons/SWOTIcon';
import { LeadGenIcon } from './icons/LeadGenIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { LibraryIcon } from './icons/LibraryIcon';
import { RFPAnalyzerIcon } from './icons/RFPAnalyzerIcon';
import { MarketPulseIcon } from './icons/MarketPulseIcon';
import { FlaskIcon } from './icons/FlaskIcon';
import { PlaybookIcon } from './icons/PlaybookIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const navGroups = [
  {
    title: 'Dashboard',
    items: [{ type: ModuleType.HOME, icon: HomeIcon }],
  },
  {
    title: 'Prospecting',
    items: [
      { type: ModuleType.LEAD_GENERATION, icon: LeadGenIcon },
      { type: ModuleType.PROSPECT_PROFILE, icon: ProspectIcon },
    ],
  },
  {
    title: 'Deal Execution',
    items: [
      { type: ModuleType.DEAL_PLAYBOOK, icon: PlaybookIcon },
      { type: ModuleType.DISCOVERY_QUESTIONS, icon: QuestionMarkIcon },
    ],
  },
  {
    title: 'Market Intelligence',
    items: [
      { type: ModuleType.MARKET_PULSE, icon: MarketPulseIcon },
      { type: ModuleType.COMPETITOR_MATRIX, icon: CompetitorIcon },
      { type: ModuleType.SWOT_ANALYSIS, icon: SWOTIcon },
    ],
  },
  {
    title: 'Internal Resources',
    items: [
      { type: ModuleType.INTERNAL_KNOWLEDGE, icon: KnowledgeIcon },
      { type: ModuleType.RFP_ANALYZER, icon: RFPAnalyzerIcon },
      { type: ModuleType.PRODUCT_GAP_ANALYSIS, icon: FlaskIcon },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { type: ModuleType.ACTIVITY_DASHBOARD, icon: ActivityIcon },
      { type: ModuleType.REPORT_LIBRARY, icon: LibraryIcon },
      { type: ModuleType.REPORT_TEMPLATES, icon: DocumentDuplicateIcon },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
    const [openSections, setOpenSections] = useState<Set<string>>(() => {
        const activeGroup = navGroups.find(g => g.items.some(i => i.type === activeModule));
        return activeGroup ? new Set([activeGroup.title]) : new Set(['Prospecting', 'Workspace']);
    });

    const toggleSection = (title: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };
    
    const NavItemButton = ({ item, isActive }: { item: { type: ModuleType, icon: React.FC<React.SVGProps<SVGSVGElement>> }, isActive: boolean}) => (
        <button
            onClick={() => setActiveModule(item.type)}
            title={item.type} // Tooltip for small screen
            className={`flex items-center justify-center md:justify-start w-full p-3 my-1 rounded-md transition-colors duration-200 ${
                isActive
                ? 'bg-sky-500 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
        >
            <item.icon className="h-6 w-6 flex-shrink-0" />
            <span className="ml-4 hidden md:block">{item.type}</span>
        </button>
    );

  return (
    <nav className="w-16 md:w-64 bg-slate-800 text-white flex flex-col">
      <div className="flex items-center justify-center md:justify-start gap-3 p-4 h-[73px] border-b border-slate-700">
        <HeliosLogo className="h-8 w-8 text-sky-400 flex-shrink-0" />
        <span className="hidden md:block text-xl font-bold">Helios</span>
      </div>
      <ul className="flex-1 mt-4 px-2 overflow-y-auto">
        {navGroups.map((group) => {
            // Render single-item groups as direct links, not accordions
            if (group.items.length === 1) {
                const item = group.items[0];
                return (
                    <li key={item.type}>
                        <NavItemButton item={item} isActive={activeModule === item.type} />
                    </li>
                );
            }

            const isOpen = openSections.has(group.title);
            return (
                <li key={group.title}>
                    {/* Group Header - only shown on medium screens and up */}
                    <button
                        onClick={() => toggleSection(group.title)}
                        className="hidden md:flex items-center justify-between w-full p-3 my-1 rounded-md text-left text-slate-300 hover:bg-slate-700 hover:text-white"
                        aria-expanded={isOpen}
                    >
                        <span className="font-semibold">{group.title}</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Group Items - collapsible on medium+, flat list on small */}
                    <div className={`md:overflow-hidden md:transition-all md:ease-in-out md:duration-300 ${isOpen ? 'md:max-h-96' : 'md:max-h-0'}`}>
                        <ul className="md:pl-2">
                            {group.items.map(item => (
                                <li key={item.type}>
                                    <NavItemButton item={item} isActive={activeModule === item.type} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </li>
            );
        })}
      </ul>
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-400 hidden md:block">
          &copy; {new Date().getFullYear()} Helios Inc.
        </p>
      </div>
    </nav>
  );
};

export default Sidebar;
