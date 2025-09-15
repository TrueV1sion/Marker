
import React, { useState, useEffect, useMemo } from 'react';
import { getSavedReports, deleteReport } from '../services/reportStore';
import { SavedReportData, ModuleType } from '../types';
import ReportView from './ReportView';
import SWOTReportView from './SWOTReportView';
import { SearchIcon } from './icons/SearchIcon';

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const getModuleClassName = (moduleType?: ModuleType): string => {
    const mapping: { [key in ModuleType]?: string } = {
        [ModuleType.PROSPECT_PROFILE]: 'bg-sky-100 text-sky-800',
        [ModuleType.COMPETITOR_MATRIX]: 'bg-amber-100 text-amber-800',
        [ModuleType.SWOT_ANALYSIS]: 'bg-green-100 text-green-800',
        [ModuleType.INTERNAL_KNOWLEDGE]: 'bg-indigo-100 text-indigo-800',
    };
    return moduleType ? (mapping[moduleType] || 'bg-slate-100 text-slate-800') : 'bg-slate-100 text-slate-800';
}

const ReportLibrary: React.FC = () => {
    const [reports, setReports] = useState<SavedReportData[]>([]);
    const [selectedReport, setSelectedReport] = useState<SavedReportData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<ModuleType | 'ALL'>('ALL');

    useEffect(() => {
        setReports(getSavedReports());
    }, []);

    const handleDeleteReport = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event
        if (window.confirm('Are you sure you want to delete this report?')) {
            const updatedReports = deleteReport(id);
            setReports(updatedReports);
        }
    };

    const filteredReports = useMemo(() => {
        return reports
            .filter(report => categoryFilter === 'ALL' || report.moduleType === categoryFilter)
            .filter(report => report.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [reports, categoryFilter, searchTerm]);
    
    const reportCategories = useMemo(() => {
        const categories = reports.map(r => r.moduleType).filter((r): r is ModuleType => !!r);
        return [...new Set(categories)];
    }, [reports]);

    if (selectedReport) {
        return (
            <div className="animate-fade-in">
                <button 
                    onClick={() => setSelectedReport(null)}
                    className="flex items-center text-sm font-semibold text-sky-600 hover:text-sky-800 mb-4 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Report Library
                </button>
                {selectedReport.moduleType === ModuleType.SWOT_ANALYSIS 
                    ? <SWOTReportView report={selectedReport} />
                    : <ReportView report={selectedReport} />
                }
            </div>
        )
    }

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Report Library</h2>
                <p className="text-slate-500 mb-4">Search and manage all of your saved reports.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search reports by title..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value as ModuleType | 'ALL')}
                            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        >
                            <option value="ALL">All Categories</option>
                            {reportCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {filteredReports.length === 0 ? (
                 <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700">No Reports Found</h3>
                    <p className="text-slate-500">{reports.length > 0 ? 'Adjust your search or filter to find reports.' : 'Generate a report in another module to see it here.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map(report => (
                        <div 
                            key={report.id} 
                            className="bg-white rounded-lg shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedReport(report)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getModuleClassName(report.moduleType)}`}>
                                        {report.moduleType || 'Report'}
                                    </span>
                                    <button onClick={(e) => handleDeleteReport(report.id, e)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete Report">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">{report.title}</h3>
                            </div>
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 rounded-b-lg">
                                <p className="text-sm text-slate-500">Saved on {formatTimestamp(report.savedAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportLibrary;
