
import React, { useState, useEffect, useCallback } from 'react';
import { fetchMarketTrends, generateMarketPulseSummary } from '../services/geminiService';
import { MarketTrend, MarketPulseSummary } from '../types';

const verticals = [
    "Payer (Insurance)", 
    "Provider (Hospitals, Clinics)", 
    "Pharmaceutical / Life Sciences", 
    "Health Tech / IT", 
    "Medical Devices"
];

const MarketPulse: React.FC = () => {
  const [activeVertical, setActiveVertical] = useState<string>(verticals[0]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [summary, setSummary] = useState<MarketPulseSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadMarketData(activeVertical);
  }, [activeVertical, loadMarketData]);

  const handleVerticalChange = (vertical: string) => {
    setActiveVertical(vertical);
  };

  const summarySections = summary ? [
    { title: 'This Year', points: summary.thisYear },
    { title: 'Last Quarter', points: summary.lastQuarter },
    { title: 'Last Month', points: summary.lastMonth },
    { title: 'Last Week', points: summary.lastWeek },
    { title: 'Looking Ahead', points: summary.lookingAhead },
  ] : [];

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Market Pulse</h2>
        <p className="text-slate-500 mb-4">Discover the latest trends, news, and regulatory updates across key healthcare verticals.</p>
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

      {isLoading && (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-700">Fetching Latest Market Data...</h3>
            <p className="text-slate-500">The AI is scanning the market for <span className="font-semibold">{activeVertical}</span>. This may take a moment.</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      {!isLoading && !error && (
        <>
        {summary && (
            <div className="mb-12 animate-fade-in">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Market Snapshot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summarySections.map((section, index) => (
                        <div key={section.title} className={`bg-white p-6 rounded-lg shadow-md ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                            <h4 className="font-bold text-slate-700 mb-3 border-b pb-2">{section.title}</h4>
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
          {trends.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700">No Trends Found</h3>
                <p className="text-slate-500">Could not find recent market trends for this vertical. Please try again later.</p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Key Market Trends</h3>
              {trends.map((trend, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
            ))}
            </>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default MarketPulse;
