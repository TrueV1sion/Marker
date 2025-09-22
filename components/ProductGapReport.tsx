import React, { useState, useEffect } from 'react';
import { getSavedGaps, deleteGap } from '../services/productGapStore';
import { ProductGap } from '../types';
import { ProspectIcon } from './icons/ProspectIcon';
import { TargetIcon } from './icons/TargetIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProductGapReport: React.FC = () => {
    const [gaps, setGaps] = useState<ProductGap[]>([]);

    useEffect(() => {
        setGaps(getSavedGaps());
    }, []);

    const handleDeleteGap = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this saved gap?')) {
            const updatedGaps = deleteGap(id);
            setGaps(updatedGaps);
        }
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Product Gap Analysis</h2>
                <p className="text-slate-500">A prioritized list of potential product and feature opportunities identified from prospect analysis.</p>
            </div>

            {gaps.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700">No Product Gaps Saved</h3>
                    <p className="text-slate-500 mt-2">When you analyze a prospect's challenges and identify a gap, save it to see it here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {gaps.map(gap => (
                        <div key={gap.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-full">
                                            <ProspectIcon className="h-5 w-5 text-slate-600"/>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">{gap.prospectName}</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 flex-shrink-0 ml-4">
                                        Saved: {formatTimestamp(gap.savedAt)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Stated Challenge Section */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <TargetIcon className="h-5 w-5 text-amber-600" />
                                            <h4 className="font-semibold text-amber-800">Stated Challenge</h4>
                                        </div>
                                        <p className="text-slate-700 text-sm">{gap.challengeDescription}</p>
                                    </div>
                                    {/* New Solution Section */}
                                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                                         <div className="flex items-center gap-3 mb-2">
                                            <LightbulbIcon className="h-5 w-5 text-sky-600" />
                                            <h4 className="font-semibold text-sky-800">New Solution Idea</h4>
                                        </div>
                                        <p className="font-medium text-sky-900 text-sm mb-2">"{gap.newSolutionIdea}"</p>
                                        <p className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-2">{gap.gapAnalysis}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 rounded-b-lg text-right">
                                <button onClick={(e) => handleDeleteGap(gap.id, e)} className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors" title="Delete Gap">
                                    Delete Gap
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGapReport;