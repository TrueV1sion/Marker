
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { performMarketResearch, scanForWatchlistAlerts } from '../services/geminiService';
import { getWatchlistItems, addWatchlistItem, deleteWatchlistItem, getWatchlistAlerts, addWatchlistAlert } from '../services/watchlistStore';
import { MarketResearchResult, SearchFocus, WatchlistItem, WatchlistAlert, AlertType } from '../types';
import { marked } from 'marked';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';
import { HeliosLogo } from './icons/HeliosLogo';
import { LinkIcon } from './icons/LinkIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { FlaskIcon } from './icons/FlaskIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { EyeIcon } from './icons/EyeIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BellIcon } from './icons/BellIcon';
import { ProspectIcon } from './icons/ProspectIcon';
import Loader from './Loader';


interface ConversationTurn {
    question: string;
    result: MarketResearchResult;
    timestamp: Date;
    answerTimestamp?: Date;
    focus: SearchFocus;
}

const POPULAR_TERMS = [
  'Value-Based Care models', 'Telehealth adoption rates', 'AI in medical diagnostics', 'Healthcare data interoperability standards', 'Patient engagement platforms', 'Remote patient monitoring devices', 'Cybersecurity in healthcare', 'Pharmaceutical supply chain challenges', 'Trends in personalized medicine', 'Medicare Advantage plan competition',
];

const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
};

const getHostname = (url: string) => {
    try {
        const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
        return match ? match[1] : url;
    } catch (e) { return url; }
};

const FOCUS_OPTIONS: { id: SearchFocus, label: string, icon: React.FC<any> }[] = [
    { id: 'ALL_WEB', label: 'All Web', icon: GlobeIcon }, { id: 'CLINICAL', label: 'Clinical & Academic', icon: FlaskIcon }, { id: 'FINANCIAL', label: 'Financial & SEC', icon: TrendingUpIcon }, { id: 'NEWS', label: 'Industry News', icon: NewspaperIcon },
];

interface MarketPulseProps {
    onTriggerAction: (action: { type: string, payload: any }) => void;
}

const MarketPulse: React.FC<MarketPulseProps> = ({ onTriggerAction }) => {
    // State for Conversational Search
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [currentQuery, setCurrentQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [searchFocus, setSearchFocus] = useState<SearchFocus>('ALL_WEB');
    
    // State for Watchlist
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
    const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
    const [newWatchlistItemName, setNewWatchlistItemName] = useState('');
    const [isScanning, setIsScanning] = useState<boolean>(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Load initial data for watchlist
    useEffect(() => {
        setWatchlistItems(getWatchlistItems());
        setAlerts(getWatchlistAlerts());
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isSearching]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = useCallback(async (queryToSearch: string) => {
        if (!queryToSearch.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setCurrentQuery('');
        setShowSuggestions(false);
        const newTurn: ConversationTurn = { question: queryToSearch, result: { answer: '', relatedQuestions: [], citations: [] }, timestamp: new Date(), focus: searchFocus };
        setConversation(prev => [...prev, newTurn]);
        try {
            const result = await performMarketResearch(queryToSearch, searchFocus);
            setConversation(prev => {
                const updatedConversation = [...prev];
                const currentTurn = updatedConversation[updatedConversation.length - 1];
                currentTurn.result = result;
                currentTurn.answerTimestamp = new Date();
                return updatedConversation;
            });
        } catch (err) {
            setSearchError('An error occurred while fetching market data. Please try again.');
            console.error(err);
        } finally {
            setIsSearching(false);
            inputRef.current?.focus();
        }
    }, [searchFocus]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCurrentQuery(query);
        if (query.trim()) {
            const filtered = POPULAR_TERMS.filter(term => term.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setCurrentQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSearching) handleSearch(currentQuery);
    };
    
    // --- Watchlist Functions ---
    const handleAddWatchlistItem = () => {
        if (!newWatchlistItemName.trim() || watchlistItems.some(i => i.name.toLowerCase() === newWatchlistItemName.trim().toLowerCase())) return;
        const newItem = addWatchlistItem({ name: newWatchlistItemName.trim(), type: 'PROSPECT' });
        setWatchlistItems(prev => [newItem, ...prev]);
        setNewWatchlistItemName('');
    };

    const handleDeleteWatchlistItem = (id: string) => {
        deleteWatchlistItem(id);
        setWatchlistItems(prev => prev.filter(item => item.id !== id));
    };

    const handleScan = async () => {
        setIsScanning(true);
        const scanPromises = watchlistItems.map(item => scanForWatchlistAlerts(item));
        const results = await Promise.all(scanPromises);
        
        results.forEach((result, index) => {
            if (result) {
                const item = watchlistItems[index];
                const newAlert = addWatchlistAlert({ ...result, watchlistItemId: item.id, watchlistItemName: item.name });
                // Avoid adding duplicate alerts
                setAlerts(prev => prev.some(a => a.title === newAlert.title && a.watchlistItemId === newAlert.watchlistItemId) ? prev : [newAlert, ...prev]);
            }
        });
        setIsScanning(false);
    };

    const exampleQuestions = ["Latest trends in value-based care.", "Key players in healthcare data analytics market?", "New regulations for medical device manufacturers?"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* --- Left Column: Watchlist --- */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col h-full max-h-[calc(100vh-4rem)]">
                <div className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                        <EyeIcon className="h-7 w-7 text-sky-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Helios Watchlist</h2>
                    </div>
                    <p className="text-slate-500 mb-4 text-sm">Proactively monitor prospects and competitors for trigger events.</p>
                
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newWatchlistItemName}
                            onChange={(e) => setNewWatchlistItemName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddWatchlistItem()}
                            placeholder="Add a company..."
                            className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                        <button onClick={handleAddWatchlistItem} className="bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 transition-colors"><PlusIcon className="h-5 w-5"/></button>
                    </div>
                
                    <div className="space-y-2 mb-4">
                        {watchlistItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                                <span className="font-semibold text-slate-700">{item.name}</span>
                                <button onClick={() => handleDeleteWatchlistItem(item.id)} className="text-slate-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleScan} disabled={isScanning || watchlistItems.length === 0} className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-800 disabled:bg-slate-300">
                        {isScanning ? <Loader /> : <BellIcon className="h-5 w-5" />}
                        {isScanning ? 'Scanning...' : 'Scan for Updates'}
                    </button>
                    <hr className="my-6"/>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-700">Recent Alerts</h3>
                    {alerts.length === 0 ? <p className="text-sm text-slate-500">No alerts yet. Scan for updates to find trigger events.</p> :
                        alerts.map(alert => (
                            <div key={alert.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm animate-fade-in-fast">
                                <p className="text-xs font-semibold text-sky-600 mb-1">{alert.watchlistItemName}</p>
                                <h4 className="font-bold text-slate-800">{alert.title}</h4>
                                <p className="text-sm text-slate-600 my-2">{alert.summary}</p>
                                <a href={alert.source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-sky-500 truncate block">{alert.source.title}</a>
                                <button onClick={() => onTriggerAction({ type: 'REFRESH_PROFILE', payload: alert.watchlistItemName })} className="mt-3 flex items-center justify-center w-full gap-2 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-md font-semibold hover:bg-sky-200 text-sm">
                                    <ProspectIcon className="h-4 w-4" /> Generate Profile
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* --- Right Column: Conversational Search --- */}
            <div className="lg:col-span-2 flex flex-col h-full max-h-[calc(100vh-4rem)] bg-white rounded-lg shadow-md">
                <div className="flex-grow overflow-y-auto p-4 space-y-8">
                    {conversation.length === 0 && !isSearching && (
                        <div className="text-center p-8 max-w-3xl mx-auto animate-fade-in">
                            <HeliosLogo className="h-12 w-12 mx-auto text-sky-400 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">Conversational Research</h3>
                            <p className="text-slate-500 mb-6">Ask anything about the healthcare market for a detailed, cited answer.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                                {exampleQuestions.map((q, i) => <button key={i} onClick={() => handleSearch(q)} className="p-3 bg-slate-50 rounded-md hover:bg-sky-100 text-slate-700 font-medium text-sm transition-colors text-center">{q}</button>)}
                            </div>
                        </div>
                    )}
                    {conversation.map((turn, index) => {
                        const focusOption = FOCUS_OPTIONS.find(f => f.id === turn.focus);
                        const Icon = focusOption?.icon;
                        return (
                        <div key={index} className="space-y-4 animate-fade-in">
                            <div className="flex justify-end items-start gap-3"><div className="flex flex-col items-end"><div className="bg-sky-500 text-white p-3 rounded-lg max-w-xl"><p>{turn.question}</p></div><p className="text-xs text-slate-400 mt-1 pr-2">{formatTimestamp(turn.timestamp)}</p></div><UserIcon className="h-8 w-8 text-slate-600 bg-slate-200 rounded-full p-1.5 flex-shrink-0" /></div>
                            {turn.result.answer && turn.answerTimestamp && (
                                <div className="flex items-start gap-3">
                                    <HeliosLogo className="h-8 w-8 text-sky-500 flex-shrink-0" />
                                    <div className="flex flex-col items-start w-full">
                                        <div className="flex-1 bg-slate-50 p-5 rounded-lg border border-slate-200 w-full max-w-3xl">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                                                {Icon && <Icon className="h-4 w-4" />}
                                                <span>Searched in {focusOption?.label}</span>
                                            </div>
                                            <div className="prose prose-base max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: marked(turn.result.answer, { gfm: true, breaks: true }) }} />
                                            {turn.result.citations.length > 0 && <div className="mt-6 pt-4 border-t"><h4 className="text-base font-bold text-slate-700 mb-3">Sources</h4><div className="space-y-3">{turn.result.citations.map((c, i) => <div key={i} className="flex items-start gap-3 text-sm group"><span className="flex-shrink-0 text-slate-400 text-xs w-5 text-center mt-1">{i + 1}.</span><a href={c.uri} target="_blank" rel="noopener noreferrer" className="flex-grow"><p className="font-semibold text-slate-800 group-hover:text-sky-600 truncate">{c.title || "Untitled"}</p><div className="flex items-center gap-1.5 text-slate-500 group-hover:text-sky-500"><LinkIcon className="h-3.5 w-3.5" /><span className="text-xs truncate">{getHostname(c.uri)}</span></div></a></div>)}</div></div>}
                                            {turn.result.relatedQuestions.length > 0 && <div className="mt-6 pt-4 border-t"><h4 className="text-base font-bold text-slate-700 mb-3">Related Questions</h4><div className="flex flex-wrap gap-2">{turn.result.relatedQuestions.map((q, i) => <button key={i} onClick={() => handleSearch(q)} className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-md text-sm font-semibold hover:bg-sky-100">{q}</button>)}</div></div>}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 pl-2">{formatTimestamp(turn.answerTimestamp)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                    })}
                    {isSearching && <div className="flex items-start gap-4 animate-fade-in"><HeliosLogo className="h-8 w-8 text-sky-500 flex-shrink-0 animate-pulse" /><div className="flex-1 bg-slate-50 p-5 rounded-lg border max-w-3xl"><p className="text-slate-500 font-medium">Helios is searching...</p><div className="mt-4 space-y-2"><div className="h-4 bg-slate-200 rounded w-full"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div></div></div>}
                    {searchError && <div className="p-4 bg-red-50 text-red-700 rounded-lg"><p>{searchError}</p></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex-shrink-0 p-4 border-t border-slate-200" ref={searchContainerRef}>
                    <div className="max-w-3xl mx-auto"><div className="relative">
                        {showSuggestions && suggestions.length > 0 && <div className="absolute bottom-full mb-2 bg-white border rounded-lg shadow-lg z-20"><p className="text-xs p-2">Suggestions</p><ul>{suggestions.map(s => <li key={s}><button className="w-full text-left px-4 py-2 hover:bg-sky-50" onClick={() => handleSuggestionClick(s)}>{s}</button></li>)}</ul></div>}
                        <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-slate-600">Focus:</span>{FOCUS_OPTIONS.map(({id, label, icon: Icon}) => <button key={id} onClick={() => setSearchFocus(id)} className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${searchFocus === id ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
                        <input ref={inputRef} type="text" value={currentQuery} onChange={handleInputChange} onKeyPress={handleKeyPress} onFocus={() => { if (currentQuery.trim() && suggestions.length > 0) setShowSuggestions(true); }} placeholder="Ask a follow-up question..." className="w-full p-4 pr-14 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" disabled={isSearching} />
                        <button onClick={() => handleSearch(currentQuery)} disabled={isSearching || !currentQuery.trim()} className="absolute right-3 bottom-3 bg-sky-500 text-white p-2.5 rounded-lg hover:bg-sky-600 disabled:bg-slate-300" aria-label="Send message"><SendIcon className="h-5 w-5" /></button>
                    </div></div>
                </div>
            </div>
        </div>
    );
};

export default MarketPulse;
