import React from 'react';
import { NewsItem } from '../types';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface NewsTimelineProps {
    newsItems: NewsItem[];
}

const NewsTimeline: React.FC<NewsTimelineProps> = ({ newsItems }) => {
    return (
        <div className="my-10">
            <h3 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-2">Recent News & Developments</h3>
            <div className="relative pl-6 border-l-2 border-slate-200">
                {newsItems.map((item, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                        <div className="absolute -left-[1.6rem] top-1 flex items-center justify-center bg-white">
                             <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center ring-4 ring-white">
                               <NewspaperIcon className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                        <div className="pl-4">
                            <p className="text-sm font-semibold text-slate-500 mb-1">{item.date}</p>
                            <p className="text-slate-700 font-medium">{item.headline}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsTimeline;