

import React, { useState, useCallback } from 'react';
import { generateLeads } from '../services/geminiService';
import { addActivity } from '../services/activityTracker';
import { LeadGenerationResult, Citation, ModuleType, ActivityType } from '../types';
import Loader from './Loader';
import { SearchIcon } from './icons/SearchIcon';
import { ProspectIcon } from './icons/ProspectIcon';

interface LeadGenerationProps {
  onGenerateProfile: (prospectName: string) => void;
}

const verticals = [
    "Payer (Insurance)", 
    "Provider (Hospitals, Clinics)", 
    "Pharmaceutical / Life Sciences", 
    "Health Tech / IT", 
    "Medical Devices"
];

const LeadGeneration: React.FC<LeadGenerationProps> = ({ onGenerateProfile }) => {
  const [vertical, setVertical] = useState<string>(verticals[0]);
  const [location, setLocation] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [result, setResult] = useState<LeadGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindProspects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const criteria = { vertical, location, keywords };
      const generatedResult = await generateLeads(criteria);
      setResult(generatedResult);
      addActivity({
        type: ActivityType.GENERATION,
        module: ModuleType.LEAD_GENERATION,
        details: { primary: `Search: ${vertical}${location ? ` in ${location}`: ''}${keywords ? ` for ${keywords}` : ''}` },
      });
    } catch (err) {
      setError('An error occurred while finding prospects. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [vertical, location, keywords]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFindProspects();
    }
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Lead Generation Engine</h2>
        <p className="text-slate-500 mb-4">Define your ideal customer profile to discover new prospects.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
                <label htmlFor="vertical" className="block text-sm font-medium text-slate-700 mb-1">Healthcare Vertical</label>
                <select id="vertical" value={vertical} onChange={(e) => setVertical(e.target.value)} className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                    {verticals.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location <span className="text-slate-400">(Optional)</span></label>
                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} onKeyPress={handleKeyPress} placeholder="e.g., California, USA" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 mb-1">Keywords / Pain Points <span className="text-slate-400">(Optional)</span></label>
                <input type="text" id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} onKeyPress={handleKeyPress} placeholder="e.g., data analytics, value-based care" className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition" disabled={isLoading} />
            </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleFindProspects}
            disabled={isLoading}
            className="flex items-center justify-center bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader /> : <SearchIcon className="h-5 w-5" />}
            <span className="ml-2">Find Prospects</span>
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {isLoading && (
         <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-700">Searching for Prospects...</h3>
            <p className="text-slate-500">The AI is scanning the market based on your criteria. This may take a moment.</p>
         </div>
      )}

      {result && (
        <div className="animate-fade-in">
          {result.leads.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700">No Prospects Found</h3>
                <p className="text-slate-500">Try adjusting your search criteria to find potential leads.</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {result.leads.map((lead, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{lead.companyName}</h3>
                            <p className="text-slate-600 mb-4 text-sm">{lead.reason}</p>
                        </div>
                        <button 
                            onClick={() => onGenerateProfile(lead.companyName)}
                            className="flex items-center justify-center w-full mt-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-md font-semibold hover:bg-sky-200 transition-colors"
                        >
                           <ProspectIcon className="h-5 w-5" />
                           <span className="ml-2">Generate Profile</span>
                        </button>
                    </div>
                ))}
            </div>
             {result.citations.length > 0 && (
                <div className="mt-12 pt-6 border-t border-slate-200 bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Sources</h3>
                <ul className="space-y-2">
                    {result.citations.map((citation, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 bg-slate-200 text-slate-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mt-1">
                        {index + 1}
                        </span>
                        <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline break-all">
                           {citation.title || citation.uri}
                        </a>
                    </li>
                    ))}
                </ul>
                </div>
            )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadGeneration;