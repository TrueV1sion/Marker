import React, { useState, useCallback } from 'react';
import { generateContentWithCitations, normalizeProspectName } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport, getSavedReports } from '../services/reportStore';
import { ReportData, ModuleType, ActivityType, SavedReportData } from '../types';
import ReportView from './ReportView';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';

interface ProspectProfileGeneratorProps {
  initialProspectName?: string;
  onStartPlaybook: (report: ReportData) => void;
}

const ProspectProfileGenerator: React.FC<ProspectProfileGeneratorProps> = ({ initialProspectName = '', onStartPlaybook }) => {
  const [prospectName, setProspectName] = useState<string>(initialProspectName);
  const [report, setReport] = useState<SavedReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for normalization flow
  const [isNormalizing, setIsNormalizing] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<{
    normalizedName: string;
    existingTitle: string | null;
  } | null>(null);

  const getDefaultPrompt = (nameToGenerate: string) => `Generate a detailed prospect profile for the healthcare organization "${nameToGenerate}".
      The response must have two parts: a well-structured markdown report and a single JSON data block.

      PART 1: COMPREHENSIVE MARKDOWN REPORT
      The report should be detailed and well-written, including the following sections using markdown formatting:
      - **Key Challenges & Pain Points:** A detailed analysis of the primary challenges the organization is facing.
      - **Strategic Initiatives & Goals:** A description of their publicly stated goals and strategic initiatives.
      - **Technology & Infrastructure:** An overview of their known technology stack, including EHR systems and data platforms.
      - **Recent News & Developments:** A summary of important recent news and announcements in paragraph form.

      PART 2: JSON DATA BLOCK
      After the markdown report, provide a JSON data block containing structured information.
      The JSON block MUST start with the exact marker \`[START_JSON_DATA]\` on a new line and end with the exact marker \`[END_JSON_DATA]\` on a new line. Do not include markdown backticks or the word "json" around the data block.

      The JSON object should have the following keys:
      1.  "executiveSummary": "Provide a brief, well-written paragraph overview of the organization's size, focus, and current market position. Following this, act as a senior sales intelligence analyst to synthesize this information. The synthesis must highlight the primary reason this organization is a timely and valuable prospect, touching upon a key challenge or initiative that represents a strategic opportunity and a recent trigger event (e.g., news, financial report) that creates urgency.",
      2.  "financialSummary": "A paragraph summarizing their financial health, including any recent earnings reports or financial announcements.",
      3.  "keyStats": An object with optional "companySize", "annualRevenue", and "primaryFocus" (string values).
      4.  "orgChartData": An array of objects for key personnel. Each object must have "name", "title", "bio" (a one-sentence description), and an optional "linkedin" (full URL).
      5.  "challengesAndInitiatives": An array of objects. Each object must have "type" ('challenge' or 'initiative') and "description" (string).
      6.  "technologyFootprint": An array of strings listing current technology vendors, EHR systems, or data platforms.
      7.  "recentNews": An array of objects summarizing recent events. Each object must have "date" (e.g., "YYYY-MM-DD" or "Month YYYY"), "headline" (string), and an optional "uri" (the direct source URL for the news item). Crucially, identify the single most impactful news item (e.g., a major partnership, acquisition, funding round, or significant product launch) and add the boolean property \`"isImpactful": true\` to that specific object. Only one item in the array should have this flag.

      Example of the JSON data block structure:
      [START_JSON_DATA]
      {
        "executiveSummary": "A brief summary...",
        "financialSummary": "A summary of finances...",
        "keyStats": {
          "companySize": "10,000+ employees",
          "annualRevenue": "$5 Billion",
          "primaryFocus": "Managed Care"
        },
        "orgChartData": [
          { "name": "Jane Doe", "title": "CEO", "bio": "...", "linkedin": "..." }
        ],
        "challengesAndInitiatives": [
          { "type": "challenge", "description": "Navigating complex regulatory changes." },
          { "type": "initiative", "description": "Launching a new digital patient engagement platform." }
        ],
        "technologyFootprint": ["Epic Systems", "Salesforce Health Cloud", "AWS"],
        "recentNews": [
          { "date": "2023-10-26", "headline": "Announced partnership with XYZ Corp to enhance data analytics.", "uri": "https://example.com/news-article", "isImpactful": true },
          { "date": "2023-09-15", "headline": "Released Q3 earnings report.", "uri": "https://example.com/earnings" }
        ]
      }
      [END_JSON_DATA]
      `;

  const executeReportGeneration = useCallback(async (nameToGenerate: string) => {
    setIsGeneratingReport(true);
    setError(null);
    setReport(null);
    
    const prompt = getDefaultPrompt(nameToGenerate);

    try {
      const generatedReport = await generateContentWithCitations(prompt, `Prospect Profile: ${nameToGenerate}`);
      
      let finalContent = generatedReport.content;
      let reportDataExtensions = {};

      const startMarker = '[START_JSON_DATA]';
      const endMarker = '[END_JSON_DATA]';
      const startIndex = finalContent.indexOf(startMarker);
      const endIndex = finalContent.indexOf(endMarker);

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonString = finalContent.substring(startIndex + startMarker.length, endIndex).trim();
        try {
          const parsedData = JSON.parse(jsonString);
          reportDataExtensions = {
            executiveSummary: parsedData.executiveSummary,
            financialSummary: parsedData.financialSummary,
            orgChartData: parsedData.orgChartData,
            keyStats: parsedData.keyStats,
            challengesAndInitiatives: parsedData.challengesAndInitiatives,
            technologyFootprint: parsedData.technologyFootprint,
            recentNews: parsedData.recentNews,
          };
          // Remove the JSON block from the main content
          finalContent = finalContent.substring(0, startIndex).trim();
        } catch (e) {
          console.error("Failed to parse structured JSON data:", e);
          // If parsing fails, leave the content as is so user can see the raw data
        }
      }
      
      const reportToSave: ReportData = { 
        ...generatedReport, 
        content: finalContent,
        ...reportDataExtensions,
        moduleType: ModuleType.PROSPECT_PROFILE 
      };

      const savedReport = saveReport(reportToSave);
      setReport(savedReport);

      addActivity({
          type: ActivityType.GENERATION,
          module: ModuleType.PROSPECT_PROFILE,
          details: { primary: nameToGenerate },
      });
    } catch (err) {
      setError('An error occurred while generating the report. Please try again.');
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);

  const handleStartGeneration = useCallback(async () => {
    if (!prospectName.trim()) {
      setError('Please enter a prospect name.');
      return;
    }

    setIsNormalizing(true);
    setError(null);
    setReport(null);
    setConfirmation(null);

    try {
      const normalized = await normalizeProspectName(prospectName);
      const reports = getSavedReports();
      const searchTitle = `prospect profile: ${normalized.toLowerCase()}`;
      const existingReport = reports.find(r => r.title.toLowerCase() === searchTitle);

      // If name is already good and no report exists, generate immediately.
      if (prospectName.trim().toLowerCase() === normalized.toLowerCase() && !existingReport) {
        await executeReportGeneration(normalized);
      } else {
        // Otherwise, show the confirmation screen
        setConfirmation({
          normalizedName: normalized,
          existingTitle: existingReport ? existingReport.title : null,
        });
      }
    } catch (err) {
      setError('An error occurred while normalizing the prospect name. Please try again.');
      console.error(err);
    } finally {
      setIsNormalizing(false);
    }
  }, [prospectName, executeReportGeneration]);

  const handleConfirmAndGenerate = async () => {
    if (!confirmation) return;
    const { normalizedName } = confirmation;
    setConfirmation(null);
    setProspectName(normalizedName); // Update input field with the standardized name
    await executeReportGeneration(normalizedName);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleStartGeneration();
    }
  }
  
  const isBusy = isNormalizing || isGeneratingReport;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Prospect Profile Generator</h2>
        <p className="text-slate-500 mb-4">Enter a customer name to generate a comprehensive Helios intelligence report.</p>
        
        {confirmation ? (
          <div className="bg-sky-50 border-l-4 border-sky-500 p-4 rounded-r-lg animate-fade-in">
            {confirmation.existingTitle && (
              <div className="bg-amber-100 border border-amber-200 text-amber-800 p-3 rounded-md mb-4">
                <p className="font-semibold">Potential Duplicate Found</p>
                <p className="text-sm">A report titled "{confirmation.existingTitle}" already exists. Please check the Report Library before generating a new one.</p>
              </div>
            )}
            <p className="text-slate-700 mb-4">
              We suggest using the standardized name: <strong className="text-slate-900">"{confirmation.normalizedName}"</strong>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleConfirmAndGenerate}
                className="flex items-center justify-center bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 transition-colors"
              >
                Use Standard Name & Generate
              </button>
              <button
                onClick={() => setConfirmation(null)}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., BCBSM, Blue Cross Michigan"
                className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isBusy}
              />
              <button
                onClick={handleStartGeneration}
                disabled={isBusy || !prospectName.trim()}
                className="flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors w-40"
              >
                {isBusy ? <Loader /> : <SearchIcon className="h-5 w-5" />}
                <span className="ml-2">{isNormalizing ? 'Validating...' : 'Generate'}</span>
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {isGeneratingReport && (
         <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-700">Generating Report...</h3>
            <p className="text-slate-500">This may take a moment. The AI is analyzing multiple sources.</p>
         </div>
      )}

      {report && <ReportView report={report} onStartPlaybook={onStartPlaybook} />}
    </div>
  );
};

export default ProspectProfileGenerator;