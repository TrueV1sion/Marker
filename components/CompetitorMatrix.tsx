import React, { useState, useCallback } from 'react';
import { generateContentWithCitations } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport } from '../services/reportStore';
// FIX: Import SavedReportData to use the correct type for the report state.
import { ReportData, ModuleType, ActivityType, SavedReportData } from '../types';
import ReportView from './ReportView';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';

const MAX_COMPETITORS = 3;

const CompetitorMatrix: React.FC = () => {
  const [competitorNames, setCompetitorNames] = useState<string[]>(['']);
  // FIX: Changed state type from ReportData to SavedReportData to match ReportView's expected props.
  const [report, setReport] = useState<SavedReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompetitorNameChange = (index: number, value: string) => {
    const newNames = [...competitorNames];
    newNames[index] = value;
    setCompetitorNames(newNames);
  };

  const addCompetitor = () => {
    if (competitorNames.length < MAX_COMPETITORS) {
      setCompetitorNames([...competitorNames, '']);
    }
  };

  const removeCompetitor = (index: number) => {
    if (competitorNames.length > 1) {
      const newNames = competitorNames.filter((_, i) => i !== index);
      setCompetitorNames(newNames);
    }
  };

  const handleGenerateReport = useCallback(async () => {
    const validCompetitors = competitorNames.map(name => name.trim()).filter(name => name !== '');
    
    if (validCompetitors.length === 0) {
      setError('Please enter at least one competitor name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);
    
    const competitorList = validCompetitors.map(name => `"${name}"`).join(' and ');
    const competitorTitle = validCompetitors.join(' vs ');

    const prompt = `Generate a detailed side-by-side competitor intelligence matrix comparing the following companies: ${competitorList}.

      Present the output as a markdown table. The first column should be the "Category" of comparison, followed by a column for each competitor.

      The categories to compare must include:
      - **Product & Service Offerings:** A clear breakdown of their solutions and key features.
      - **Go-to-Market Strategy:** A summary of their marketing approach, including target audience and key messaging.
      - **Publicly Announced Client Wins:** A list of recent major customer acquisitions or partnerships.
      - **Perceived Strengths:** A summary of their key strengths based on industry analysis and reviews.
      - **Perceived Weaknesses:** A summary of their key weaknesses.
      
      Use web search to analyze their websites, press releases, and marketing materials directly to gather up-to-date information. Ensure the comparison is direct and highlights the differences and similarities for each category.`;

    try {
      const generatedReport = await generateContentWithCitations(prompt, `Competitor Matrix: ${competitorTitle}`);
      const reportToSave: ReportData = { ...generatedReport, moduleType: ModuleType.COMPETITOR_MATRIX };
      
      // FIX: Use the return value from saveReport to get the complete SavedReportData object.
      const savedReport = saveReport(reportToSave);
      setReport(savedReport);

      addActivity({
        type: ActivityType.GENERATION,
        module: ModuleType.COMPETITOR_MATRIX,
        details: { primary: competitorTitle },
      });
    } catch (err) {
      setError('An error occurred while generating the report. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [competitorNames]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateReport();
    }
  };
  
  const canAnalyze = competitorNames.some(name => name.trim() !== '');

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Competitor Intelligence Matrix</h2>
        <p className="text-slate-500 mb-4">Enter up to {MAX_COMPETITORS} competitors for a side-by-side analysis.</p>
        <div className="space-y-3 mb-4">
          {competitorNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => handleCompetitorNameChange(index, e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Competitor ${index + 1}`}
                className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isLoading}
                aria-label={`Competitor ${index + 1} name`}
              />
              {competitorNames.length > 1 && (
                <button
                  onClick={() => removeCompetitor(index)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  title="Remove Competitor"
                  aria-label={`Remove competitor ${index + 1}`}
                  disabled={isLoading}
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={addCompetitor}
            disabled={isLoading || competitorNames.length >= MAX_COMPETITORS}
            className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Competitor
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isLoading || !canAnalyze}
            className="flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader /> : <SearchIcon className="h-5 w-5" />}
            <span className="ml-2">Analyze</span>
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {isLoading && (
         <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-700">Analyzing Competitors...</h3>
            <p className="text-slate-500">This may take a moment as the AI synthesizes data from various sources.</p>
         </div>
      )}

      {report && <ReportView report={report} />}
    </div>
  );
};

export default CompetitorMatrix;
