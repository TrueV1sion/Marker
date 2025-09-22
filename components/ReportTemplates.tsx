
import React, { useState, useEffect, useCallback } from 'react';
import { getSeededTemplates, saveTemplate, deleteTemplate } from '../services/templateStore';
import { ReportTemplate } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { TargetIcon } from './icons/TargetIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { EmailIcon } from './icons/EmailIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { BombIcon } from './icons/BombIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  TargetIcon,
  ChecklistIcon,
  EmailIcon,
  ChatBubbleIcon,
  BombIcon,
  UsersIcon,
};

const ReportTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplatePrompt, setNewTemplatePrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

    useEffect(() => {
        setTemplates(getSeededTemplates());
    }, []);

    const handleSaveTemplate = useCallback(() => {
        if (!newTemplateName.trim() || !newTemplatePrompt.trim()) {
            setError('Both template name and prompt are required.');
            return;
        }
        setError(null);
        saveTemplate({ name: newTemplateName, prompt: newTemplatePrompt });
        setTemplates(getSeededTemplates()); // Refresh list
        setNewTemplateName('');
        setNewTemplatePrompt('');
    }, [newTemplateName, newTemplatePrompt]);

    const handleDeleteTemplate = (id: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            const updatedTemplates = deleteTemplate(id);
            setTemplates(updatedTemplates);
        }
    };

    const toggleActiveTemplate = (id: string) => {
        setActiveTemplateId(prevId => prevId === id ? null : id);
    }

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Report Template Gallery</h2>
                <p className="text-slate-500">Manage your reusable templates for generating prospect profiles. Browse our strategic templates or create your own.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Create Form --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Create Custom Template</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="template-name" className="block text-sm font-medium text-slate-700 mb-1">
                                    Template Name
                                </label>
                                <input
                                    id="template-name"
                                    type="text"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="e.g., Payer Deep Dive"
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="template-prompt" className="block text-sm font-medium text-slate-700 mb-1">
                                    Template Prompt
                                </label>
                                <textarea
                                    id="template-prompt"
                                    value={newTemplatePrompt}
                                    onChange={(e) => setNewTemplatePrompt(e.target.value)}
                                    rows={10}
                                    placeholder="Enter your custom report structure and questions..."
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Use <code className="bg-slate-200 text-slate-600 px-1 rounded-sm">{`{{prospectName}}`}</code> as a placeholder for the company name.
                                </p>
                            </div>
                             {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button
                                onClick={handleSaveTemplate}
                                className="w-full flex items-center justify-center bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span className="ml-2">Save Template</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Template List --- */}
                <div className="lg:col-span-2">
                    {templates.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-700">No Custom Templates</h3>
                            <p className="text-slate-500 mt-2">Create your first template using the form to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {templates.map(template => {
                                const Icon = template.icon ? ICONS[template.icon] : DocumentTextIcon;
                                const isOpen = activeTemplateId === template.id;

                                return (
                                <div key={template.id} className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200/50 hover:ring-sky-300 transition-shadow">
                                    <div className="p-4 cursor-pointer flex justify-between items-start gap-4" onClick={() => toggleActiveTemplate(template.id)}>
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 bg-slate-100 rounded-lg p-3">
                                                <Icon className="h-6 w-6 text-slate-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{template.name}</h4>
                                                <p className="text-sm text-slate-500">{template.job || 'Custom user-created template.'}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2 flex-shrink-0">
                                            {template.isDefault ? (
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-600">Default</span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTemplate(template.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                    title="Delete Template"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                         </div>
                                    </div>
                                    {isOpen && (
                                        <div className="px-4 pb-4 animate-fade-in-fast">
                                            <div className="pt-4 border-t border-slate-200">
                                                <p className="text-sm font-semibold text-slate-600 mb-2">Template Prompt:</p>
                                                <pre className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md whitespace-pre-wrap font-sans">
                                                    {template.prompt}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportTemplates;