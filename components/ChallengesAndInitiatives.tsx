import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import { ReportData, ChallengeOrInitiative, TalkingPointsResult } from '../types';
import { saveGap } from '../services/productGapStore';
import { generateTalkingPointsForChallenge } from '../services/geminiService';
import { TargetIcon } from './icons/TargetIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import Loader from './Loader';

interface ChallengesAndInitiativesProps {
    report: ReportData;
}

const ChallengesAndInitiatives: React.FC<ChallengesAndInitiativesProps> = ({ report }) => {
    const data = report.challengesAndInitiatives || [];
    const challenges = data.filter(item => item.type === 'challenge');
    const initiatives = data.filter(item => item.type === 'initiative');

    const [activeAnalysis, setActiveAnalysis] = useState<{ [key: string]: { isLoading: boolean; result: TalkingPointsResult | null; error: string | null } }>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleGenerate = useCallback(async (item: ChallengeOrInitiative) => {
        setActiveAnalysis(prev => ({
            ...prev,
            [item.description]: { isLoading: true, result: null, error: null }
        }));

        try {
            const prospectName = report.title.replace('Prospect Profile: ', '');
            const result = await generateTalkingPointsForChallenge(item.description, prospectName, report.content);
            setActiveAnalysis(prev => ({
                ...prev,
                [item.description]: { isLoading: false, result, error: null }
            }));
        } catch (err) {
            console.error(err);
            setActiveAnalysis(prev => ({
                ...prev,
                [item.description]: { isLoading: false, result: null, error: 'Failed to generate insights.' }
            }));
        }
    }, [report]);

    const handleSaveGap = (item: ChallengeOrInitiative, result: TalkingPointsResult) => {
        if (!result.isGap || !result.newSolutionIdea) return;
        
        saveGap({
            prospectName: report.title.replace('Prospect Profile: ', ''),
            challengeDescription: item.description,
            gapAnalysis: result.gapAnalysis,
            newSolutionIdea: result.newSolutionIdea
        });
        showToast("Product gap saved successfully!");
    };
    
    const renderItem = (item: ChallengeOrInitiative, Icon: React.FC<any>, borderColor: string, bgColor: string) => {
        const analysis = activeAnalysis[item.description];
        const isAnalyzing = analysis?.isLoading;
        const result = analysis?.result;
        const error = analysis?.error;

        return (
            <div key={item.description} className={`bg-white border-l-4 ${borderColor} p-4 rounded-r-md shadow-sm transition-all`}>
                <div className="flex items-start gap-4">
                    <Icon className={`h-6 w-6 ${borderColor.replace('border', 'text')} flex-shrink-0 mt-1`} />
                    <div className="flex-1">
                        <p className="text-slate-700">{item.description}</p>
                    </div>
                    <button
                        onClick={() => handleGenerate(item)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isAnalyzing ? <Loader /> : <MagicWandIcon className="h-4 w-4" />}
                        <span>{result ? 'Re-analyze' : 'Analyze'}</span>
                    </button>
                </div>
                {analysis && (
                    <div className="mt-4 pl-10 animate-fade-in-fast">
                        {isAnalyzing && <p className="text-sm text-slate-500">AI is analyzing...</p>}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {result && (
                             <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                                <h5 className="font-bold text-slate-800 mb-2 text-sm">Strategic Response</h5>
                                <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: marked(result.talkingPoints, { gfm: true, breaks: true }) }} />
                                
                                <div className={`mt-3 pt-3 border-t border-slate-200 text-xs p-2 rounded-md ${result.isGap ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    <p><span className="font-bold">{result.isGap ? 'GAP IDENTIFIED: ' : 'PRODUCT MATCH: '}</span>{result.gapAnalysis}</p>
                                </div>

                                {result.isGap && result.newSolutionIdea && (
                                     <div className="mt-3">
                                        <h6 className="font-bold text-sky-800 text-sm">New Solution Idea:</h6>
                                        <p className="text-sm text-slate-600 italic">"{result.newSolutionIdea}"</p>
                                        <button 
                                            onClick={() => handleSaveGap(item, result)}
                                            className="mt-2 text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded font-semibold hover:bg-sky-200 transition-colors"
                                        >
                                            Save to Product Gap Report
                                        </button>
                                     </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="my-10 relative">
             {toastMessage && (
                <div className="fixed top-24 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
                    {toastMessage}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Stated Challenges</h3>
                    <div className="space-y-4">
                        {challenges.map(item => renderItem(item, TargetIcon, 'border-amber-400', 'bg-amber-50'))}
                        {challenges.length === 0 && <p className="text-slate-500 p-4">No specific challenges identified.</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Strategic Initiatives</h3>
                     <div className="space-y-4">
                        {initiatives.map(item => renderItem(item, LightbulbIcon, 'border-sky-400', 'bg-sky-50'))}
                        {initiatives.length === 0 && <p className="text-slate-500 p-4">No specific initiatives identified.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengesAndInitiatives;