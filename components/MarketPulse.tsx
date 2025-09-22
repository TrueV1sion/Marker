import React, { useState, useEffect, useCallback } from 'react';
import { fetchMarketTrends, generateMarketPulseSummary, generatePersonalizedInsights } from '../services/geminiService';
import { MarketTrend, MarketPulseSummary, UserPersona } from '../types';
import { marked } from 'marked';
import { UserIcon } from './icons/UserIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

const verticals = [
    "Payer (Insurance)", 
    "Provider (Hospitals, Clinics)", 
    "Pharmaceutical / Life Sciences", 
    "Health Tech / IT", 
    "Medical Devices"
];

const userPersonas: UserPersona[] = [
    'Sales Development Rep',
    'Account Executive',
    'Sales Leadership',
    'Market Analyst'
];

const MarketPulse: React.FC = () => {
  const [activeVertical, setActiveVertical] = useState<string>(verticals[0]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [summary, setSummary] = useState<MarketPulseSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // State for personalized insights
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(userPersonas[0]);
  const [insights, setInsights] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const loadMarketData = useCallback(async (vertical: string) => {
    setIsLoading(true);
    setError(null);
    setTrends([]);
    setSummary(null);
    try {
      // Fetch trends and summary in parallel
      const [fetchedTrends, fetchedSummary] = await Promise.all([
          fetchMarketTrends(vertical),
          generateMarketPulseSummary(vertical)
      ]);
      setTrends(fetchedTrends);
      setSummary(fetchedSummary);
    } catch (err) {
      setError('An error occurred while fetching market data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect for insights
  useEffect(() => {
    if (summary) {
      const getInsights = async () => {
        setIsInsightsLoading(true);
        setInsightsError(null);
        setInsights(null);
        try {
          const result = await generatePersonalizedInsights(summary, selectedPersona);
          setInsights(result);
        } catch (err) {
          setInsightsError('Failed to generate personalized insights.');
          console.error(err);
        } finally {
          setIsInsightsLoading(false);
        }
      };
      getInsights();
    }
  }, [summary, selectedPersona]);

  const handleVerticalChange = (vertical: string) => {
    setActiveVertical(vertical);
    if (dataLoaded) {
        loadMarketData(vertical);
    }
  };
  
  const handleFetchClick = () => {
      setDataLoaded(true);
      loadMarketData(activeVertical);
  };

  const summarySections = summary ? [
    { title: 'This Year', points: summary.thisYear },
    { title: 'Last Quarter', points: summary.lastQuarter },
    { title: 'Last Month', points: summary.lastMonth },
    { title: 'Last Week', points: summary.lastWeek },
    { title: 'Looking Ahead', points: summary.lookingAhead },
  ] : [];

  const parsedInsights = insights ? marked(insights, { gfm: true, breaks: true }) : '';

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Market Pulse</h2>
        <p className="text-slate-500 mb-4">Discover the latest trends, news, and regulatory updates across key healthcare verticals.</p>
        <div className="border-t border-b border-slate-200 py-4 my-4">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Select Vertical</h3>
          <div className="flex flex-wrap gap-2">
            {verticals.map(v => (
              <button 
                key={v}
                onClick={() => handleVerticalChange(v)}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${activeVertical === v ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
         <div>
             <h3 className="text-sm font-semibold text-slate-600 mb-2">Personalize Insights For</h3>
             <div className="flex flex-wrap gap-2">
                {userPersonas.map(p => (
                    <button 
                        key={p}
                        onClick={() => setSelectedPersona(p)}
                        className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${selectedPersona === p ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                        {p}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-700">Fetching Latest Market Data...</h3>
            <p className="text-slate-500">The AI is scanning the market for <span className="font-semibold">{activeVertical}</span>. This may take a moment.</p>
        </div>
      )}

      {!isLoading && !dataLoaded && (
        <div className="text-center p-8 bg-white rounded-lg shadow-md animate-fade-in">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Scan the Market</h3>
          <p className="text-slate-500 mb-6">Select a vertical and click the button to begin analysis.</p>
          <button
            onClick={handleFetchClick}
            className="flex items-center justify-center mx-auto bg-sky-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-600 transition-colors"
          >
            <SearchIcon className="h-5 w-5" />
            <span className="ml-2">Fetch Data for {activeVertical}</span>
          </button>
        </div>
      )}

      {!isLoading && dataLoaded && (
        <>
        {error && <p className="text-red-500 text-center py-4">{error}</p>}

        {!error && (
        <>
        {(isInsightsLoading || insights || insightsError) && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                        <UserIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">What You Need to Know: <span className="font-normal text-indigo-600">{selectedPersona}</span></h3>
                </div>
                {isInsightsLoading && (
                    <div className="flex items-center justify-center min-h-[100px]">
                        <p className="text-slate-500">Generating personalized insights...</p>
                    </div>
                )}
                {insightsError && <p className="text-red-500">{insightsError}</p>}
                {insights && (
                    <div
                        className="prose prose-slate max-w-none prose-sm prose-li:my-1"
                        dangerouslySetInnerHTML={{ __html: parsedInsights as string }}
                    />
                )}
            </div>
        )}

        {summary && (
            <div className="mb-12 animate-fade-in">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Market Snapshot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summarySections.map((section, index) => (
                        <div key={section.title} className={`bg-white p-6 rounded-lg shadow-md ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                            <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-3 border-b pb-2">
                                <CalendarIcon className="h-5 w-5 text-slate-500"/>
                                {section.title}
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                                {section.points.map((point, i) => <li key={i}>{point}</li>)}
                                {section.points.length === 0 && <li className="text-slate-400 list-none">No key insights found.</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="space-y-6 animate-fade-in">
          {trends.length === 0 && summary ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700">No Trends Found</h3>
                <p className="text-slate-500">Could not find recent market trends for this vertical. Please try again later.</p>
            </div>
          ) : (
            <>
              {trends.length > 0 && <h3 className="text-2xl font-bold text-slate-800 mb-6">Key Market Trends</h3>}
              {trends.map((trend, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-slate-100 text-slate-500 rounded-lg p-3 mt-1">
                        <NewspaperIcon className="h-6 w-6"/>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">{trend.title}</h4>
                        <p className="text-slate-600 mb-4">{trend.summary}</p>
                        <a 
                          href={trend.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          Read More &rarr;
                        </a>
                    </div>
                </div>
              </div>
            ))}
            </>
          )}
        </div>
        </>
      )}
      </>
    )}
    </div>
  );
};

export default MarketPulse;