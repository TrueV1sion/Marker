import React, { useState, useCallback } from 'react';
import { generateOutreachEmail } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { ReportData, EmailData, ActivityType } from '../types';
import Loader from './Loader';

interface OutreachModalProps {
  report: ReportData;
  onClose: () => void;
}

const OutreachModal: React.FC<OutreachModalProps> = ({ report, onClose }) => {
  const [persona, setPersona] = useState('');
  const [tone, setTone] = useState('');
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateEmail = useCallback(async () => {
    if (!persona.trim() || !tone.trim()) {
      setError('Please provide both a target persona and a desired tone.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEmailData(null);

    try {
      const prospectName = report.title.replace('Prospect Profile: ', '');
      const generatedEmail = await generateOutreachEmail(prospectName, report.content, persona, tone);
      setEmailData(generatedEmail);
      addActivity({
        type: ActivityType.OUTREACH,
        module: 'Outreach Drafted',
        details: {
          primary: prospectName,
          secondary: `Persona: ${persona}, Tone: ${tone}`
        },
      });
    } catch (err) {
      setError('An error occurred while generating the email. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [persona, tone, report]);

  const handleCopyToClipboard = () => {
    if (!emailData) return;
    const emailContent = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(emailContent).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy email content.');
    });
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="outreach-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 id="outreach-title" className="text-xl font-bold text-slate-800">Personalized Outreach Assistant</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors" aria-label="Close modal">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="persona" className="block text-sm font-medium text-slate-700 mb-1">
                Target Persona
              </label>
              <input
                type="text"
                id="persona"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., CIO, VP of Analytics"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-1">
                Tone of Voice
              </label>
              <input
                type="text"
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g., Formal, concise, value-focused"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleGenerateEmail}
              disabled={isLoading || !persona.trim() || !tone.trim()}
              className="bg-sky-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
            >
              {isLoading ? (
                <span className="flex items-center justify-center"><Loader /> <span className="ml-2">Drafting Email...</span></span>
              ) : (
                'Draft Email'
              )}
            </button>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          {(isLoading || emailData) && (
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              {isLoading && !emailData && (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-500">
                    <p>AI is crafting a personalized email based on the report...</p>
                </div>
              )}
              {emailData && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Generated Email</h3>
                        <button 
                            onClick={handleCopyToClipboard}
                            className="bg-slate-200 text-slate-700 px-3 py-1 text-sm rounded-md font-semibold hover:bg-slate-300 transition-colors"
                        >
                            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                    <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-700">Subject: <span className="font-normal">{emailData.subject}</span></p>
                        <hr className="my-2" />
                        <p className="whitespace-pre-wrap text-slate-700">{emailData.body}</p>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachModal;
