import React from 'react';
import { NewsItem } from '../types';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { StarIcon } from './icons/StarIcon';

interface NewsTimelineProps {
    newsItems: NewsItem[];
}

const NewsTimeline: React.FC<NewsTimelineProps> = ({ newsItems }) => {
    return (
        <div className="my-10">
            <h3 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-2">Recent News & Developments</h3>
            <div className="flow-root">
                <ul className="-mb-8">
                    {newsItems.map((item, index) => {
                        const isImpactful = !!item.isImpactful;
                        return (
                            <li key={index}>
                                <div className="relative pb-8">
                                    {index !== newsItems.length - 1 ? (
                                        <span className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${isImpactful ? 'bg-amber-300' : 'bg-slate-200'}`} aria-hidden="true"></span>
                                    ) : null}
                                    <div className="relative flex space-x-3 items-start">
                                        <div>
                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${isImpactful ? 'bg-amber-400 ring-white' : 'bg-slate-200 ring-white'}`}>
                                                {isImpactful ? <StarIcon className="h-5 w-5 text-white" /> : <NewspaperIcon className="h-5 w-5 text-slate-500" />}
                                            </span>
                                        </div>
                                        <div className={`min-w-0 flex-1 py-1.5 rounded-md transition-colors ${isImpactful ? 'bg-amber-50 p-4 -mt-2' : ''}`}>
                                             {isImpactful && (
                                                <div className="text-xs font-bold uppercase text-amber-600 mb-1">
                                                    Key Development
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <p className="font-semibold text-slate-500 mb-1">{item.date}</p>
                                                {item.uri ? (
                                                    <a
                                                        href={item.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-slate-800 hover:text-sky-600 hover:underline transition-colors"
                                                    >
                                                        {item.headline}
                                                    </a>
                                                ) : (
                                                    <p className="font-medium text-slate-800">{item.headline}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default NewsTimeline;
