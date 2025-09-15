import React from 'react';
import { ChipIcon } from './icons/ChipIcon';

interface TechnologyFootprintProps {
    tech: string[];
}

const TechnologyFootprint: React.FC<TechnologyFootprintProps> = ({ tech }) => {
    return (
        <div className="my-10">
            <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Technology Footprint</h3>
            <div className="flex flex-wrap gap-3">
                {tech.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full">
                       <ChipIcon className="h-5 w-5 text-slate-500" />
                       <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechnologyFootprint;