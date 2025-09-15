import React, { useState, useEffect, useMemo } from 'react';
import { getActivities } from '../services/activityTracker';
import type { ActivityEvent } from '../types';
import { ActivityType, ModuleType } from '../types';
import { ProspectIcon } from './icons/ProspectIcon';
import { CompetitorIcon } from './icons/CompetitorIcon';
import { SWOTIcon } from './icons/SWOTIcon';
import { KnowledgeIcon } from './icons/KnowledgeIcon';
import { LeadGenIcon } from './icons/LeadGenIcon';
import { EmailIcon } from './icons/EmailIcon';

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

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ActivityDashboard: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<'ALL' | ActivityType.GENERATION | ActivityType.OUTREACH>('ALL');

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const filteredActivities = useMemo(() => {
    if (filter === 'ALL') {
      return activities;
    }
    return activities.filter(activity => activity.type === filter);
  }, [activities, filter]);

  const getModuleTitle = (activity: ActivityEvent): string => {
    if (activity.type === ActivityType.OUTREACH) {
        return 'Outreach Drafted';
    }
    return `${activity.module} Generated`;
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Activity Dashboard</h2>
        <p className="text-slate-500 mb-4">A log of all generation and outreach activities.</p>
        <div className="flex gap-2">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${filter === 'ALL' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>All</button>
            <button onClick={() => setFilter(ActivityType.GENERATION)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${filter === ActivityType.GENERATION ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Generations</button>
            <button onClick={() => setFilter(ActivityType.OUTREACH)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${filter === ActivityType.OUTREACH ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Outreaches</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700">No Activity Yet</h3>
                <p className="text-slate-500">Generate a report or draft an outreach email to see it logged here.</p>
            </div>
        ) : (
            filteredActivities.map(activity => {
                const Icon = ICONS[activity.module] || EmailIcon;
                const title = getModuleTitle(activity);

                return (
                    <div key={activity.id} className="bg-white p-4 rounded-lg shadow-sm flex items-start gap-4">
                        <div className="flex-shrink-0 bg-slate-100 rounded-full p-3">
                           <Icon className="h-6 w-6 text-slate-500" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-slate-800">{title}</p>
                            <p className="text-slate-600 truncate">
                                {activity.details.primary}
                            </p>
                             {activity.details.secondary && (
                                <p className="text-xs text-slate-400 mt-1">{activity.details.secondary}</p>
                            )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                           <p className="text-sm text-slate-500">{formatTimestamp(activity.timestamp)}</p>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default ActivityDashboard;
