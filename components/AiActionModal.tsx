import React, { useState, useEffect, useCallback } from 'react';
import { explainText, generateTalkingPoint, generateEmailSnippet } from '../services/geminiService';
import Loader from './Loader';

type ActionType = 'explain' | 'point' | 'snippet';

interface AiActionModalProps {
  action: ActionType;
  selectedText: string;
  onClose: () => void;
}

const ACTION_CONFIG = {
    explain: {
        title: 'Explain Concept',
        apiCall: explainText,
    },
    point: {
        title: 'Generate Talking Point',
        apiCall: generateTalkingPoint,
    },
    snippet: {
        title: 'Draft Outreach Snippet',
        apiCall: generateEmailSnippet,
    }
};

const AiActionModal: React.FC<AiActionModalProps> = ({ action, selectedText, onClose }) => {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const config = ACTION_CONFIG[action];

  useEffect(() => {
    const performAction = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await config.apiCall(selectedText);
        setResult(response);
      } catch (err) {
        setError('An error occurred. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    performAction();
  }, [action, selectedText, config]);

  const handleCopyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-action-title"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 id="ai-action-title" className="text-xl font-bold text-slate-800">{config.title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors" aria-label="Close modal">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
            <p className="text-sm font-semibold text-slate-600">Selected Text:</p>
            <p className="text-sm text-slate-800 italic">"{selectedText}"</p>
          </div>
          <div className="min-h-[200px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Loader />
                <p className="mt-2">AI is working...</p>
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {result && (
              <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                {result}
              </div>
            )}
          </div>
        </div>
        {result && (
          <footer className="p-4 border-t border-slate-200 bg-slate-50 text-right">
            <button
              onClick={handleCopyToClipboard}
              className="bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 transition-colors"
            >
              {isCopied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default AiActionModal;
