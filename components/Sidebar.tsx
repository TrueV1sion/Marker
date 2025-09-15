
import React from 'react';
// FIX: ModuleType is an enum, which is used as a value at runtime. It needs to be imported with a standard import, not 'import type'.
import { ModuleType } from '../types';
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

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const navItems = [
  { type: ModuleType.PROSPECT_PROFILE, icon: ProspectIcon },
  { type: ModuleType.LEAD_GENERATION, icon: LeadGenIcon },
  { type: ModuleType.COMPETITOR_MATRIX, icon: CompetitorIcon },
  { type: ModuleType.SWOT_ANALYSIS, icon: SWOTIcon },
  { type: ModuleType.MARKET_PULSE, icon: MarketPulseIcon },
  { type: ModuleType.INTERNAL_KNOWLEDGE, icon: KnowledgeIcon },
  { type: ModuleType.RFP_ANALYZER, icon: RFPAnalyzerIcon },
  { type: ModuleType.PRODUCT_GAP_ANALYSIS, icon: FlaskIcon },
  { type: ModuleType.ACTIVITY_DASHBOARD, icon: ActivityIcon },
  { type: ModuleType.REPORT_LIBRARY, icon: LibraryIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  return (
    <nav className="w-16 md:w-64 bg-slate-800 text-white flex flex-col">
      <div className="flex items-center justify-center md:justify-start gap-3 p-4 h-[73px] border-b border-slate-700">
        <HeliosLogo className="h-8 w-8 text-sky-400 flex-shrink-0" />
        <span className="hidden md:block text-xl font-bold">Helios</span>
      </div>
      <ul className="flex-1 mt-4">
        {navItems.map((item) => {
          const isActive = activeModule === item.type;
          return (
            <li key={item.type} className="px-2">
              <button
                onClick={() => setActiveModule(item.type)}
                className={`flex items-center w-full p-3 my-1 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span className="ml-4 hidden md:block">{item.type}</span>
              </button>
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