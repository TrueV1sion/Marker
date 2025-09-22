import React from 'react';
import { NavGroup } from '../navigation';
import { ModuleType } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface LaunchpadProps {
    group: NavGroup | null;
    onClose: () => void;
    onSelectModule: (module: ModuleType) => void;
}

const Launchpad: React.FC<LaunchpadProps> = ({ group, onClose, onSelectModule }) => {
    if (!group) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 flex flex-col p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div className="flex-shrink-0 text-right mb-4">
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <XCircleIcon className="h-10 w-10" />
                </button>
            </div>

            <div 
                className="flex-grow flex flex-col justify-center"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">{group.title}</h2>
                </div>
                <div className="space-y-3">
                    {group.items.map((item, index) => (
                        <button
                            key={item.type}
                            onClick={() => onSelectModule(item.type)}
                            className="w-full flex items-center gap-4 bg-white/10 text-white p-4 rounded-lg hover:bg-white/20 transition-all text-left animate-slide-up-fade"
                            style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                        >
                            <div className="bg-white/20 p-3 rounded-md">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <span className="text-lg font-semibold">{item.type}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Launchpad;
