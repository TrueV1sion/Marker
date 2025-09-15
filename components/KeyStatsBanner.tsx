import React from 'react';
import { KeyStats } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface KeyStatsBannerProps {
  stats: KeyStats;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-slate-200 rounded-lg p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};


const KeyStatsBanner: React.FC<KeyStatsBannerProps> = ({ stats }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            <StatCard 
                icon={<UsersIcon className="h-6 w-6 text-slate-600" />}
                label="Company Size"
                value={stats.companySize}
            />
            <StatCard 
                icon={<DollarSignIcon className="h-6 w-6 text-slate-600" />}
                label="Annual Revenue"
                value={stats.annualRevenue}
            />
            <StatCard 
                icon={<BriefcaseIcon className="h-6 w-6 text-slate-600" />}
                label="Primary Focus"
                value={stats.primaryFocus}
            />
        </div>
    </div>
  );
};

export default KeyStatsBanner;