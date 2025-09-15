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

    const prompt = `Generate a detailed prospect profile for the healthcare organization "${prospectName}".
      The response must have two parts: a well-structured markdown report and a single JSON data block.

      PART 1: COMPREHENSIVE MARKDOWN REPORT
      The report should be detailed and well-written, including the following sections using markdown formatting:
      - **Executive Summary:** A brief overview of the organization's size, focus, and current market position.
      - **Financial Summary:** A paragraph summarizing their financial health, including any recent earnings reports or financial announcements.
      - **Key Challenges & Pain Points:** A detailed analysis of the primary challenges the organization is facing.
      - **Strategic Initiatives & Goals:** A description of their publicly stated goals and strategic initiatives.
      - **Technology & Infrastructure:** An overview of their known technology stack, including EHR systems and data platforms.
      - **Recent News & Developments:** A summary of important recent news and announcements in paragraph form.

      PART 2: JSON DATA BLOCK
      After the markdown report, provide a JSON data block containing structured information.
      The JSON block MUST start with the exact marker \`[START_JSON_DATA]\` on a new line and end with the exact marker \`[END_JSON_DATA]\` on a new line. Do not include markdown backticks or the word "json" around the data block.

      The JSON object should have the following keys:
      1.  "keyStats": An object with optional "companySize", "annualRevenue", and "primaryFocus" (string values).
      2.  "orgChartData": An array of objects for key personnel. Each object must have "name", "title", "bio" (a one-sentence description), and an optional "linkedin" (full URL).
      3.  "challengesAndInitiatives": An array of objects. Each object must have "type" ('challenge' or 'initiative') and "description" (string).
      4.  "technologyFootprint": An array of strings listing current technology vendors, EHR systems, or data platforms.
      5.  "recentNews": An array of objects summarizing recent events. Each object must have "date" (e.g., "YYYY-MM-DD" or "Month YYYY") and "headline" (string).

      Example of the JSON data block structure:
      [START_JSON_DATA]
      {
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
          { "date": "2023-10-26", "headline": "Announced partnership with XYZ Corp to enhance data analytics." }
        ]
      }
      [END_JSON_DATA]
      `;

    try {
      const generatedReport = await generateContentWithCitations(prompt, `Prospect Profile: ${prospectName}`);
      
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
      
      const finalReport: ReportData = { 
        ...generatedReport, 
        content: finalContent,
        ...reportDataExtensions,
        moduleType: ModuleType.PROSPECT_PROFILE 
      };

      setReport(finalReport);
      saveReport(finalReport);
      addActivity({
          type: ActivityType.GENERATION,
          module: ModuleType.PROSPECT_PROFILE,
          details: { primary: prospectName },
      });
    } catch (err)
 {
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