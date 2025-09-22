import React from 'react';
import { NavGroup, NavItem } from '../navigation';
import { ModuleType } from '../types';

interface MobileNavProps {
    navGroups: NavGroup[];
    onOpenLaunchpad: (group: NavGroup) => void;
    onNavigate: (module: ModuleType) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ navGroups, onOpenLaunchpad, onNavigate }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-slate-800 border-t border-slate-700 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.2)] z-20">
            <div className="flex justify-around items-center h-full px-2">
                {navGroups.map(group => {
                    const handlePress = () => {
                        if (group.items.length === 1) {
                            onNavigate(group.items[0].type);
                        } else {
                            onOpenLaunchpad(group);
                        }
                    };
                    const Icon = group.icon;
                    return (
                        <button
                            key={group.title}
                            onClick={handlePress}
                            className="flex flex-col items-center justify-center text-slate-300 hover:text-white transition-colors w-16"
                        >
                            <Icon className="h-7 w-7 mb-1" />
                            <span className="text-xs font-medium tracking-tight">{group.title}</span>
                        </button>
                    );
                })}
            </div>
        </footer>
    );
};

export default MobileNav;
