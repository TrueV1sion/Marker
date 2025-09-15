
import React, { useState, useCallback } from 'react';
import { generateContentWithCitations } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport } from '../services/reportStore';
import { ReportData, ModuleType, ActivityType } from '../types';
import ReportView from './ReportView';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';

interface ProspectProfileGeneratorProps {
  initialProspectName?: string;
}

const ProspectProfileGenerator: React.FC<ProspectProfileGeneratorProps> = ({ initialProspectName = '' }) => {
  const [prospectName, setProspectName] = useState<string>(initialProspectName);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = useCallback(async () => {
    if (!prospectName.trim()) {
      setError('Please enter a prospect name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const prompt = `Generate a detailed prospect profile for the healthcare organization "${prospectName}". The report must be well-structured and include the following sections:
      - **Executive Summary:** A brief overview of the organization's size, focus, and current market position.
      - **Key Personnel:** A list of C-suite executives and relevant department heads.
      - **Stated Challenges & Initiatives:** Direct quotes or summaries of problems they are trying to solve or projects they are undertaking (e.g., "improving value-based care outcomes," "reducing administrative overhead").
      - **Technology Footprint:** Mentions of current technology vendors, EHR systems, or data platforms they use.
      - **Recent News & Financials:** A bulleted list of the most important recent events and a summary of their financial health.
      
      Ensure all information is based on public sources and presented in a professional, easy-to-read format. Use markdown for formatting.`;

    try {
      const generatedReport = await generateContentWithCitations(prompt, `Prospect Profile: ${prospectName}`);
      const finalReport = { ...generatedReport, moduleType: ModuleType.PROSPECT_PROFILE };
      setReport(finalReport);
      saveReport(finalReport);
      addActivity({
          type: ActivityType.GENERATION,
          module: ModuleType.PROSPECT_PROFILE,
          details: { primary: prospectName },
      });
    } catch (err) {
      setError('An error occurred while generating the report. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prospectName]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateReport();
    }
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Prospect Profile Generator</h2>
        <p className="text-slate-500 mb-4">Enter the name of a potential customer to generate a comprehensive intelligence report.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Blue Shield of California"
            className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerateReport}
            disabled={isLoading || !prospectName.trim()}
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
            <h3 className="text-lg font-semibold text-slate-700">Generating Report...</h3>
            <p className="text-slate-500">This may take a moment. The AI is analyzing multiple sources.</p>
         </div>
      )}

      {report && <ReportView report={report} />}
    </div>
  );
};

export default ProspectProfileGenerator;