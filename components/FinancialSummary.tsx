import React from 'react';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface FinancialSummaryProps {
    summary: string;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ summary }) => {
    return (
        <div className="my-10 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 bg-green-200 rounded-full p-2">
                    <TrendingUpIcon className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700">Financial Summary</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">{summary}</p>
        </div>
    );
};

export default FinancialSummary;
