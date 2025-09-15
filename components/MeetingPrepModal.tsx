import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { generateMeetingBriefing } from '../services/geminiService';
import type { ReportData } from '../types';
import Loader from './Loader';

interface MeetingPrepModalProps {
  report: ReportData;
  onClose: () => void;
}

const MeetingPrepModal: React.FC<MeetingPrepModalProps> = ({ report, onClose }) => {
  const [attendees, setAttendees] = useState('');
  const [objective, setObjective] = useState('');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateBriefing = useCallback(async () => {
    if (!attendees.trim() || !objective.trim()) {
      setError('Please provide both attendees and a meeting objective.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBriefing(null);

    try {
      const prospectName = report.title.replace('Prospect Profile: ', '');
      const generatedBriefing = await generateMeetingBriefing(prospectName, report.content, attendees, objective);
      setBriefing(generatedBriefing);
    } catch (err) {
      setError('An error occurred while generating the briefing. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [attendees, objective, report]);

  const parsedBriefing = briefing ? marked(briefing, { gfm: true, breaks: true }) : '';

  return (
    <div 
        className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-prep-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 id="meeting-prep-title" className="text-xl font-bold text-slate-800">Meeting Preparation Assistant</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors" aria-label="Close modal">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="attendees" className="block text-sm font-medium text-slate-700 mb-1">
                Meeting Attendees
              </label>
              <input
                type="text"
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="e.g., Jane Doe, CIO"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-slate-700 mb-1">
                Meeting Objective
              </label>
              <input
                type="text"
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g., Discovery call for data warehousing needs"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleGenerateBriefing}
              disabled={isLoading || !attendees.trim() || !objective.trim()}
              className="bg-sky-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
            >
              {isLoading ? (
                <span className="flex items-center justify-center"><Loader /> <span className="ml-2">Generating Briefing...</span></span>
              ) : (
                'Generate Briefing'
              )}
            </button>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          {(isLoading || briefing) && (
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 min-h-[200px]">
              {isLoading && !briefing && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <p>AI is analyzing the report and your meeting goals...</p>
                </div>
              )}
              {briefing && (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: parsedBriefing as string }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingPrepModal;