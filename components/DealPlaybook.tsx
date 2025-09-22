
import React, { useState, useEffect, useCallback } from 'react';
import { PlaybookData, ReportData } from '../types';
import { generateStrategicContent } from '../services/geminiService';
import { MagicWandIcon } from './icons/MagicWandIcon';
import Loader from './Loader';
import { SaveIcon } from './icons/SaveIcon';
import { CheckIcon } from './icons/CheckIcon';

const DEAL_PLAYBOOK_DB_KEY = 'helios_deal_playbook_db';

const usePlaybookState = (initialReport: ReportData | null) => {
    const [playbooks, setPlaybooks] = useState<{[key: string]: PlaybookData}>(() => {
        try {
            const saved = localStorage.getItem(DEAL_PLAYBOOK_DB_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const [activeProspect, setActiveProspect] = useState<string>('');

    useEffect(() => {
        localStorage.setItem(DEAL_PLAYBOOK_DB_KEY, JSON.stringify(playbooks));
    }, [playbooks]);

    useEffect(() => {
        if (initialReport) {
            const prospectName = initialReport.title.replace('Prospect Profile: ', '');
            setActiveProspect(prospectName);
            if (!playbooks[prospectName]) {
                const challenges = initialReport.challengesAndInitiatives?.filter(c => c.type === 'challenge').map(c => c.description).join('\n') || '';
                const initiatives = initialReport.challengesAndInitiatives?.filter(c => c.type === 'initiative').map(i => i.description).join('\n') || '';
                
                const newPlaybook: PlaybookData = {
                    prospectName: prospectName,
                    painPoints: challenges,
                    clientGoals: initiatives
                };
                setPlaybooks(prev => ({ ...prev, [prospectName]: newPlaybook }));
            }
        } else if (Object.keys(playbooks).length > 0 && !activeProspect) {
             setActiveProspect(Object.keys(playbooks)[0]);
        }
    }, [initialReport]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!activeProspect) return;
        const { name, value } = e.target;
        setPlaybooks(prev => ({
            ...prev,
            [activeProspect]: { ...prev[activeProspect], [name]: value }
        }));
    };
    
    const updateField = (fieldName: keyof PlaybookData, value: string) => {
        if (!activeProspect) return;
        setPlaybooks(prev => ({
            ...prev,
            [activeProspect]: { ...prev[activeProspect], [fieldName]: value }
        }));
    };
    
    const createNewPlaybook = (name: string) => {
        if (!name || playbooks[name]) return; // prevent empty or duplicate
        setPlaybooks(prev => ({ ...prev, [name]: { prospectName: name } }));
        setActiveProspect(name);
    }

    const currentData = playbooks[activeProspect] || {};
    return { playbooks, activeProspect, setActiveProspect, currentData, handleInputChange, updateField, createNewPlaybook };
};

const Accordion: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <details className="bg-white rounded-lg shadow-sm mb-4 open:ring-1 open:ring-sky-200 transition" open>
        <summary className="text-lg font-bold text-slate-800 p-4 cursor-pointer">
            {title}
        </summary>
        <div className="p-4 border-t border-slate-200">
            {children}
        </div>
    </details>
);

const FormField: React.FC<{ name: keyof PlaybookData, label: string, value: string, onChange: any, placeholder?: string, isTextarea?: boolean, onAssist?: () => void, isAssisting?: boolean }> =
    ({ name, label, value, onChange, placeholder, isTextarea = false, onAssist, isAssisting }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
            {onAssist && (
                <button onClick={onAssist} disabled={isAssisting} className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800 disabled:text-slate-400">
                    {isAssisting ? <Loader /> : <MagicWandIcon className="h-4 w-4" />}
                    AI Assist
                </button>
            )}
        </div>
        {isTextarea ? (
            <textarea id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition min-h-[120px]" />
        ) : (
            <input type="text" id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition" />
        )}
    </div>
);

const DealPlaybook: React.FC<{ initialReport: ReportData | null }> = ({ initialReport }) => {
    const { playbooks, activeProspect, setActiveProspect, currentData, handleInputChange, updateField, createNewPlaybook } = usePlaybookState(initialReport);
    const [newProspectName, setNewProspectName] = useState('');
    const [assistingField, setAssistingField] = useState<keyof PlaybookData | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    const handleSave = useCallback(() => {
        if (!activeProspect) return;
        setSaveStatus('saved');
        setTimeout(() => {
            setSaveStatus('idle');
        }, 2000);
    }, [activeProspect]);

    const handleAiAssist = async (fieldName: keyof PlaybookData, fieldLabel: string, contextFields: (keyof PlaybookData)[]) => {
        setAssistingField(fieldName);
        const context = `Prospect: ${currentData.prospectName}\n` + contextFields.map(key => {
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(); // a bit of formatting
            return `${label}: ${currentData[key] || 'Not specified'}`;
        }).join('\n');
        
        try {
            const result = await generateStrategicContent(context, fieldLabel);
            updateField(fieldName, result);
        } catch (error) {
            console.error("AI Assist failed:", error);
            // Optionally show an error to the user
        } finally {
            setAssistingField(null);
        }
    };

    const exportData = () => {
        if (!activeProspect) return;
        const dataStr = JSON.stringify(currentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeProspect.replace(/ /g, '_')}_deal_playbook_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Deal Playbook</h2>
                        <p className="text-slate-500">Manage your sales opportunity from discovery to close.</p>
                    </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleSave}
                            disabled={!activeProspect || saveStatus === 'saved'}
                            className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-colors w-full md:w-[180px] ${
                            saveStatus === 'saved'
                                ? 'bg-green-500 text-white cursor-default'
                                : 'bg-slate-700 text-white hover:bg-slate-800'
                            } disabled:bg-slate-300`}
                        >
                            {saveStatus === 'saved' ? (
                                <>
                                    <CheckIcon className="h-5 w-5 mr-2" />
                                    Playbook Saved
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="h-5 w-5 mr-2" />
                                    Save Playbook
                                </>
                            )}
                        </button>
                        <button onClick={exportData} disabled={!activeProspect} className="bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 transition-colors w-full md:w-auto">
                            Export Playbook
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                     <div>
                        <label htmlFor="prospectSelect" className="block text-sm font-medium text-slate-700 mb-1">Select Prospect</label>
                        <select id="prospectSelect" value={activeProspect} onChange={e => setActiveProspect(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                            {Object.keys(playbooks).length === 0 && <option>No playbooks yet</option>}
                            {Object.keys(playbooks).map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                     <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <label htmlFor="newProspect" className="block text-sm font-medium text-slate-700 mb-1">Or Create New</label>
                             <input id="newProspect" type="text" value={newProspectName} onChange={e => setNewProspectName(e.target.value)} placeholder="New prospect name..." className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition" />
                        </div>
                        <button onClick={() => { createNewPlaybook(newProspectName); setNewProspectName(''); }} className="bg-slate-700 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-800 h-[42px]">Create</button>
                    </div>
                </div>
            </div>
            
            {!activeProspect ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700">No Playbook Selected</h3>
                    <p className="text-slate-500">Select a prospect or create a new playbook to get started.</p>
                </div>
            ) : (
            <div className="animate-fade-in">
                <Accordion title="1. Discovery: Prospect & Opportunity">
                    <FormField name="prospectName" label="Prospect Name:" value={currentData.prospectName} onChange={handleInputChange} />
                    <FormField name="opportunityIdentified" label="Opportunity Identified (Risk, Quality, etc.):" value={currentData.opportunityIdentified} onChange={handleInputChange} />
                    <FormField name="painPoints" label="Prospect pain point(s)/opportunities:" value={currentData.painPoints} onChange={handleInputChange} isTextarea onAssist={() => handleAiAssist('painPoints', 'Prospect pain points', ['prospectName', 'opportunityIdentified'])} isAssisting={assistingField === 'painPoints'}/>
                    <FormField name="businessCase" label="Problem statement and how we can help (Mini business case):" value={currentData.businessCase} onChange={handleInputChange} isTextarea onAssist={() => handleAiAssist('businessCase', 'Problem statement / business case', ['prospectName', 'painPoints'])} isAssisting={assistingField === 'businessCase'}/>
                </Accordion>
                
                <Accordion title="2. Preparation: Strategy & Positioning">
                     <FormField name="competitors" label="Competitors (and why they could win):" value={currentData.competitors} onChange={handleInputChange} isTextarea onAssist={() => handleAiAssist('competitors', 'Competitor analysis', ['prospectName'])} isAssisting={assistingField === 'competitors'}/>
                     <FormField name="storyTelling" label="Storytelling to Win: Craft stories around each problem and solution." value={currentData.storyTelling} onChange={handleInputChange} isTextarea onAssist={() => handleAiAssist('storyTelling', 'Storytelling to win', ['prospectName', 'painPoints', 'businessCase'])} isAssisting={assistingField === 'storyTelling'}/>
                </Accordion>
                
                <Accordion title="3. Execution: Demo Notes">
                    <FormField name="keyTakeaways" label="Key Takeaways during the demonstration:" value={currentData.keyTakeaways} onChange={handleInputChange} isTextarea/>
                    <FormField name="questionsAsked" label="Questions Asked & Answers Confirmed:" value={currentData.questionsAsked} onChange={handleInputChange} isTextarea/>
                    <FormField name="wowFactors" label="What did the prospect like/not like? 'Wow' factors?" value={currentData.wowFactors} onChange={handleInputChange} isTextarea/>
                </Accordion>

                <Accordion title="4. Follow-Up: Next Steps">
                    <FormField name="followUpCommunication" label="Follow-Up Communication Plan:" value={currentData.followUpCommunication} onChange={handleInputChange} isTextarea placeholder="Craft communication that directly affirms the demonstration delivered as expected."/>
                    <FormField name="nextSteps" label="Agreement on Next Best Steps:" value={currentData.nextSteps} onChange={handleInputChange} isTextarea/>
                </Accordion>
            </div>
            )}
        </div>
    );
};

export default DealPlaybook;
