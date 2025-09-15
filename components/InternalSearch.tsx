
import React, { useState, useCallback } from 'react';
import { generateInternalKnowledge } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { saveReport } from '../services/reportStore';
import { ReportData, ModuleType, ActivityType } from '../types';
import ReportView from './ReportView';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';
import { UploadIcon } from './icons/UploadIcon';

const InternalSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const generatedReport = await generateInternalKnowledge(query);
      const finalReport = { ...generatedReport, moduleType: ModuleType.INTERNAL_KNOWLEDGE };
      setReport(finalReport);
      saveReport(finalReport);
      addActivity({
        type: ActivityType.GENERATION,
        module: ModuleType.INTERNAL_KNOWLEDGE,
        details: { primary: query },
      });
    } catch (err) {
      setError('An error occurred during the search. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Internal Knowledge Search</h2>
          <p className="text-slate-500 mb-4">Ask a question to search your private library of documents.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Find case studies on improving HEDIS scores"
              className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader /> : <SearchIcon className="h-5 w-5" />}
              <span className="ml-2">Search</span>
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Manage Knowledge Base</h3>
          <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center">
            <UploadIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <label htmlFor="file-upload" className="cursor-pointer text-sky-600 font-semibold hover:underline">
              Upload documents
            </label>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-slate-500 mt-1">PDF, DOCX, PPTX</p>
          </div>
           {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-600">Uploaded files:</p>
              <ul className="text-xs text-slate-500 list-disc list-inside">
                {files.map((file, index) => <li key={index}>{file.name}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-slate-700">Searching internal documents...</h3>
              <p className="text-slate-500">This may take a moment.</p>
          </div>
        )}
        {report && <ReportView report={report} />}
      </div>
    </div>
  );
};

export default InternalSearch;