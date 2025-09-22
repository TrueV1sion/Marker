
import React, { useState } from 'react';
import { ModuleType } from '../types';
import { NavItem, navGroups } from '../navigation';
import { HeliosLogo } from './icons/HeliosLogo';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

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
    
    const NavItemButton = ({ item, isActive }: { item: NavItem, isActive: boolean}) => (
        <button
            onClick={() => setActiveModule(item.type)}
            title={item.type} 
            className={`flex items-center w-full p-3 my-1 rounded-md transition-colors duration-200 ${
                isActive
                ? 'bg-sky-500 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
        >
            <item.icon className="h-6 w-6 flex-shrink-0" />
            <span className="ml-4">{item.type}</span>
        </button>
    );

  return (
    <nav className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 h-full">
        <div className="flex items-center justify-start gap-3 p-4 h-[73px] border-b border-slate-700 flex-shrink-0">
            <HeliosLogo className="h-8 w-8 text-sky-400 flex-shrink-0" />
            <span className="text-xl font-bold">Helios</span>
        </div>
        <ul className="flex-1 mt-4 px-2 overflow-y-auto">
            {navGroups.map((group) => {
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
                        <button
                            onClick={() => toggleSection(group.title)}
                            className="flex items-center justify-between w-full p-3 my-1 rounded-md text-left text-slate-300 hover:bg-slate-700 hover:text-white"
                            aria-expanded={isOpen}
                        >
                            <span className="font-semibold">{group.title}</span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all ease-in-out duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                            <ul className="pl-2">
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
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Helios Inc.
            </p>
        </div>
    </nav>
  );
};

export default Sidebar;
