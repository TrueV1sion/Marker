import React, { useState, useEffect } from 'react';
import { getSavedGaps, deleteGap } from '../services/productGapStore';
import { ProductGap } from '../types';

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProductGapReport: React.FC = () => {
    const [gaps, setGaps] = useState<ProductGap[]>([]);

    useEffect(() => {
        setGaps(getSavedGaps());
    }, []);

    const handleDeleteGap = (id: string) => {
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

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {gaps.length === 0 ? (
                    <div className="text-center p-12">
                        <h3 className="text-lg font-semibold text-slate-700">No Product Gaps Saved</h3>
                        <p className="text-slate-500 mt-2">When you analyze a prospect's challenges and identify a gap, save it to see it here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-600">Prospect</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Stated Challenge / Initiative</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">New Solution Idea</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Saved On</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gaps.map(gap => (
                                <tr key={gap.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                    <td className="p-4 align-top">
                                        <p className="font-semibold text-slate-800">{gap.prospectName}</p>
                                    </td>
                                    <td className="p-4 align-top max-w-sm">
                                        <p className="text-slate-600 text-sm">{gap.challengeDescription}</p>
                                    </td>
                                    <td className="p-4 align-top max-w-sm">
                                        <p className="font-medium text-sky-700 text-sm">{gap.newSolutionIdea}</p>
                                        <p className="text-xs text-slate-500 mt-1">{gap.gapAnalysis}</p>
                                    </td>
                                    <td className="p-4 align-top">
                                        <p className="text-sm text-slate-500">{formatTimestamp(gap.savedAt)}</p>
                                    </td>
                                    <td className="p-4 align-top">
                                        <button onClick={() => handleDeleteGap(gap.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete Gap">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductGapReport;