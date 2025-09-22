import React from 'react';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface ExecutiveSummaryProps {
    summary: string;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
    return (
        <div className="my-8 bg-sky-50 border-l-4 border-sky-500 rounded-r-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 bg-sky-200 rounded-full p-2">
                    <DocumentTextIcon className="h-6 w-6 text-sky-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700">Executive Summary</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">{summary}</p>
        </div>
    );
};

export default ExecutiveSummary;
