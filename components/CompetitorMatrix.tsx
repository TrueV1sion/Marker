
import React, { useState, useCallback } from 'react';
import { generateContentWithCitations } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport } from '../services/reportStore';
import { ReportData, ModuleType, ActivityType } from '../types';
import ReportView from './ReportView';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';

const CompetitorMatrix: React.FC = () => {
  const [competitorName, setCompetitorName] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = useCallback(async () => {
    if (!competitorName.trim()) {
      setError('Please enter a competitor name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const prompt = `Generate a competitor intelligence matrix for "${competitorName}". The analysis should be structured into the following sections:
      - **Product & Service Offerings:** A clear breakdown of their solutions and key features.
      - **Go-to-Market Strategy & Messaging:** A detailed analysis of their marketing approach. This should include:
        - **Key Value Propositions:** What are the core benefits they highlight?
        - **Slogans & Taglines:** List their main marketing slogans.
        - **Identified Target Audience:** Who are they speaking to in their messaging (e.g., payers, providers, pharma)?
        - **Content & Channel Strategy:** Briefly describe the type of content they produce (e.g., whitepapers, webinars) and where they promote it.
      - **Publicly Announced Client Wins:** A list of recent customer acquisitions and partnerships.
      - **Perceived Strengths & Weaknesses:** A summary of what industry analysts, customer reviews, and news articles say about them.
      
      Present the information in a clear, comparative dashboard format using markdown for structure. Use web search to analyze their website and marketing materials directly.`;

    try {
      const generatedReport = await generateContentWithCitations(prompt, `Competitor Matrix: ${competitorName}`);
      const finalReport = { ...generatedReport, moduleType: ModuleType.COMPETITOR_MATRIX };
      setReport(finalReport);
      saveReport(finalReport);
      addActivity({
        type: ActivityType.GENERATION,
        module: ModuleType.COMPETITOR_MATRIX,
        details: { primary: competitorName },
      });
    } catch (err) {
      setError('An error occurred while generating the report. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [competitorName]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateReport();
    }
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Competitor Intelligence Matrix</h2>
        <p className="text-slate-500 mb-4">Enter a competitor's name for a deep-dive analysis of their market presence.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={competitorName}
            onChange={(e) => setCompetitorName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Cotiviti"
            className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerateReport}
            disabled={isLoading || !competitorName.trim()}
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
            <h3 className="text-lg font-semibold text-slate-700">Analyzing Competitor...</h3>
            <p className="text-slate-500">This may take a moment as the AI synthesizes data from various sources.</p>
         </div>
      )}

      {report && <ReportView report={report} />}
    </div>
  );
};

export default CompetitorMatrix;