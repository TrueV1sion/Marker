import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { marked } from 'marked';
import { ModuleType, ActivityEvent, SavedReportData } from '../types';
import { getActivities } from '../services/activityTracker';
import { getSavedReports } from '../services/reportStore';
import { generateWeeklyBriefing } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { ProspectIcon } from './icons/ProspectIcon';
import { LeadGenIcon } from './icons/LeadGenIcon';
import { CompetitorIcon } from './icons/CompetitorIcon';
import { SWOTIcon } from './icons/SWOTIcon';
import { KnowledgeIcon } from './icons/KnowledgeIcon';
import { EmailIcon } from './icons/EmailIcon';

// --- Dashboard Widgets ---

const WelcomeHeader: React.FC = () => {
    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">{greeting}.</h1>
            <p className="text-slate-500 mt-1">Here's your intelligence overview for today.</p>
        </div>
    );
};

const QuickActions: React.FC<{ setActiveModule: (module: ModuleType) => void }> = ({ setActiveModule }) => {
    const actions = [
        { title: 'Generate Prospect Profile', module: ModuleType.PROSPECT_PROFILE, icon: ProspectIcon },
        { title: 'Find New Leads', module: ModuleType.LEAD_GENERATION, icon: LeadGenIcon },
        { title: 'Analyze a Competitor', module: ModuleType.COMPETITOR_MATRIX, icon: CompetitorIcon },
    ];
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {actions.map(action => (
                    <button key={action.module} onClick={() => setActiveModule(action.module)} className="p-4 bg-slate-50 rounded-lg hover:bg-sky-100 hover:ring-2 hover:ring-sky-200 transition-all text-center">
                        <action.icon className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">{action.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const KeyInsights: React.FC = () => {
    const [briefing, setBriefing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setBriefing(null);
        try {
            const reports = getSavedReports();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentReports = reports.filter(r => new Date(r.savedAt) >= oneWeekAgo);

            if (recentReports.length === 0) {
                setBriefing("No reports were generated in the last 7 days to create a briefing.");
                setIsLoading(false); // Stop loading if no reports
                return;
            }

            const generatedBriefing = await generateWeeklyBriefing(recentReports);
            setBriefing(generatedBriefing);
        } catch (err) {
            setError('An error occurred while generating the weekly briefing.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const parsedBriefing = briefing ? marked(briefing, { gfm: true, breaks: true }) : '';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Key Insights</h2>
                    <p className="text-sm text-slate-500">An AI-generated summary of your activity from the last 7 days.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 transition-colors"
                >
                    {isLoading ? <Loader /> : <MagicWandIcon className="h-5 w-5" />}
                    <span>Generate Briefing</span>
                </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 min-h-[150px]">
                {isLoading && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>AI is analyzing your recent reports...</p>
                    </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
                {briefing && (
                    <div
                        className="prose prose-slate max-w-none prose-sm"
                        dangerouslySetInnerHTML={{ __html: parsedBriefing as string }}
                    />
                )}
                {!isLoading && !briefing && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                        <p className="font-semibold">Ready for your weekly debrief?</p>
                        <p className="text-xs">Click "Generate Briefing" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const RecentActivity: React.FC = () => {
    const activities = useMemo(() => getActivities().slice(0, 5), []);
    
    const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
        [ModuleType.PROSPECT_PROFILE]: ProspectIcon,
        [ModuleType.LEAD_GENERATION]: LeadGenIcon,
        [ModuleType.COMPETITOR_MATRIX]: CompetitorIcon,
        [ModuleType.SWOT_ANALYSIS]: SWOTIcon,
        [ModuleType.INTERNAL_KNOWLEDGE]: KnowledgeIcon,
        'Outreach Drafted': EmailIcon,
    };
    
    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        
        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-slate-500 text-sm">No recent activity. Generate a report to get started.</p>
                ) : (
                    activities.map(activity => {
                        const Icon = ICONS[activity.module] || KnowledgeIcon;
                        return (
                             <div key={activity.id} className="flex items-center gap-4">
                                <div className="flex-shrink-0 bg-slate-100 rounded-full p-3">
                                   <Icon className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-700 text-sm">{activity.module}</p>
                                    <p className="text-slate-500 text-sm truncate">{activity.details.primary}</p>
                                </div>
                                <p className="text-xs text-slate-400 flex-shrink-0">{formatTimestamp(activity.timestamp)}</p>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};


const Home: React.FC<{ setActiveModule: (module: ModuleType) => void }> = ({ setActiveModule }) => {
    return (
        <div className="animate-fade-in">
            <WelcomeHeader />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">
                    <QuickActions setActiveModule={setActiveModule} />
                </div>
                <div className="lg:col-span-2">
                    <KeyInsights />
                </div>
                <div className="lg:col-span-1">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};

export default Home;