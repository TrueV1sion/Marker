
import React, { useState, useCallback } from 'react';
import { generateSWOTAnalysis } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport } from '../services/reportStore';
import { ReportData, ModuleType, ActivityType } from '../types';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';
import SWOTReportView from './SWOTReportView';

const SWOTAnalysisGenerator: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAnalysis = useCallback(async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const generatedReportData = await generateSWOTAnalysis(companyName);
      const finalReport = { ...generatedReportData, moduleType: ModuleType.SWOT_ANALYSIS };
      setReport(finalReport);
      saveReport(finalReport);
      addActivity({
        type: ActivityType.GENERATION,
        module: ModuleType.SWOT_ANALYSIS,
        details: { primary: companyName },
      });
    } catch (err) {
      setError('An error occurred while generating the analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [companyName]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateAnalysis();
    }
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">SWOT Analysis Generator</h2>
        <p className="text-slate-500 mb-4">Enter a company name to generate a strategic SWOT analysis.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Inovalon"
            className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerateAnalysis}
            disabled={isLoading || !companyName.trim()}
            className="flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader /> : <SearchIcon className="h-5 w-5" />}
            <span className="ml-2">Generate</span>
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {isLoading && (
         <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-700">Generating SWOT Analysis...</h3>
            <p className="text-slate-500">The AI is performing a strategic assessment. This may take a moment.</p>
         </div>
      )}

      {report && <SWOTReportView report={report} />}
    </div>
  );
};

export default SWOTAnalysisGenerator;