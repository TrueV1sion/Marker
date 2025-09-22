import React, { useState, useCallback } from 'react';
import { analyzeRFP } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport } from '../services/reportStore';
import { RFPAnalysisResult, ModuleType, ActivityType, ReportData, RFPRequirement, SavedReportData } from '../types';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';
import ReportView from './ReportView';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WarningIcon } from './icons/WarningIcon';

const RFPAnalyzer: React.FC = () => {
  const [rfpText, setRfpText] = useState<string>('');
  const [analysis, setAnalysis] = useState<RFPAnalysisResult | null>(null);
  const [report, setReport] = useState<SavedReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isShowingReport, setIsShowingReport] = useState<boolean>(false);

  const formatAnalysisForReport = (analysisResult: RFPAnalysisResult): ReportData => {
    let markdownContent = `Based on the provided document, here is a breakdown of the requirements, suggested answers, and identified gaps.\n\n`;
    
    markdownContent += `| # | Status | Requirement | Suggested Answer |\n`;
    markdownContent += `|---|---|---|---|\n`;

    analysisResult.analysis.forEach((item, index) => {
        const requirementText = item.requirement.replace(/\n/g, '<br />');
        const answerText = item.suggestedAnswer.replace(/\n/g, '<br />');
        markdownContent += `| ${index + 1} | ${item.status} | ${requirementText} | ${answerText} |\n`;
    });

    const reportTitle = "RFP / Security Questionnaire Analysis";

    return {
        title: reportTitle,
        content: markdownContent,
        citations: [],
        moduleType: ModuleType.RFP_ANALYZER,
    };
  };

  const handleAnalyze = useCallback(async () => {
    if (!rfpText.trim()) {
      setError('Please paste the content of the RFP or questionnaire.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setReport(null);
    setIsShowingReport(false);

    try {
      const result = await analyzeRFP(rfpText);
      setAnalysis(result);
      const reportToSave = formatAnalysisForReport(result);
      
      const savedReport = saveReport(reportToSave);
      setReport(savedReport);

      addActivity({
        type: ActivityType.GENERATION,
        module: ModuleType.RFP_ANALYZER,
        details: { primary: "RFP Analysis" },
      });
    } catch (err) {
      setError('An error occurred during the analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [rfpText]);

  const renderAnalysisDashboard = (analysisResult: RFPAnalysisResult) => (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-slate-800">Analysis Results</h3>
            <button
                onClick={() => setIsShowingReport(true)}
                className="bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 transition-colors text-sm"
            >
                View as Report
            </button>
        </div>
        <div className="space-y-4">
            {analysisResult.analysis.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className={`p-4 ${item.status === 'GAP' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between">
                             <h4 className="font-semibold text-slate-700">Requirement #{index + 1}</h4>
                             <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'GAP' ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                                {item.status === 'GAP' ? <WarningIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                                {item.status === 'GAP' ? 'Gap Identified' : 'Answered'}
                            </span>
                        </div>
                        <p className="text-slate-600 mt-2">{item.requirement}</p>
                    </div>
                    <div className="p-4 border-t border-slate-200">
                        <h5 className="font-semibold text-slate-600 text-sm mb-2">Suggested Answer / Next Step</h5>
                        <p className="text-slate-800 whitespace-pre-wrap">{item.suggestedAnswer}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
  
  if (isShowingReport && report) {
      return (
           <div className="animate-fade-in">
                <button 
                    onClick={() => setIsShowingReport(false)}
                    className="flex items-center text-sm font-semibold text-sky-600 hover:text-sky-800 mb-4 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Analysis Dashboard
                </button>
                <ReportView report={report} />
            </div>
      )
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">RFP & Security Analyzer</h2>
        <p className="text-slate-500 mb-4">Paste the content of your document to extract requirements, find answers, and flag gaps.</p>
        <div className="mb-4">
            <textarea
                value={rfpText}
                onChange={(e) => setRfpText(e.target.value)}
                placeholder="Paste the full text of your RFP, RFI, or security questionnaire here..."
                className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isLoading}
            />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !rfpText.trim()}
            className="flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader /> : <SearchIcon className="h-5 w-5" />}
            <span className="ml-2">Analyze Document</span>
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {isLoading && (
         <div className="text-center p-8 bg-white rounded-lg shadow-md mt-8">
            <h3 className="text-lg font-semibold text-slate-700">Analyzing Document...</h3>
            <p className="text-slate-500">The AI is extracting requirements and searching for answers. This may take some time for large documents.</p>
         </div>
      )}

      {analysis && renderAnalysisDashboard(analysis)}
    </div>
  );
};

export default RFPAnalyzer;