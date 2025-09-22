import React, { useState, useEffect, useCallback } from 'react';
import { getSavedReports } from '../services/reportStore';
import { answerDiscoveryQuestions } from '../services/geminiService';
import type { AnsweredQuestionCategory } from '../services/geminiService';
import { SavedReportData, ModuleType } from '../types';
import Loader from './Loader';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { QuestionCircleIcon } from './icons/QuestionCircleIcon';

const staticQuestions = {
    "General": [
        "Lines of business and membership volumes by LOB",
        "In which states do they have members—growth opportunities? How has membership growth rate been?",
        "Any major local/regional changes in market, i.e. did they lose or gain members recently? Know if Stars or transfer payment detail and ask why change if any.",
        "Who are their major competitors?",
        "Discuss current processes for risk, quality, interventions etc. Determine what is done in-house vs. using a vendor",
        "As appropriate, determine current vendors for risk analysis, risk submissions, quality and who their auditor. EMR connections, which health systems are they part of?",
        "Confirm regulatory requirements (NCQA, CMS, others? State based needs, specific populations etc).",
        "How do they share data across health plan/functional units? (Internal reporting, just spreadsheets etc?)",
        "Do they have an enterprise data management system?",
        "Do they participate in VBC/do they offer any provider incentives?",
        "How do they share data with their providers? How do providers know their gaps in care?",
        "Do they use a portal? How open are their providers to accessing their own data?",
        "Quality and Risk integrated at plan level? Do they have a coordinate risk/quality outreach where quality and risk gaps are closed?",
        "Describe MRR process: do they do their own collection and abstraction or use a vendor?",
        "Do they do year-round MRR?",
        "Do they use electronic records collection at all? Are they allowed?",
        "Does the risk and quality team use same chart? (share to get most out of it)"
    ],
    "Converged Quality": [
        "How was HEDIS season, were you happy with the results?",
        "Do you feel well equipped for next HEDIS season?",
        "How is your STAR rating? What initiatives do you have in place to increase your STAR rating?",
        "What sort of transparency do you currently have into your analytics? Is it enough?",
        "How does your data team handle getting ready for regulatory reporting?",
        "Are their any specific measures that your team is focusing on this year?",
        "How are you preparing for digital measure requirements?",
        "How are you collecting and organizing Charts for medical record review?",
        "How much time are you spending on identifying Quality gaps and outreach those members appropriately?",
        "How are you tailoring and adjusting to the complexities and differences between ACA vs Medicaid, and across national markets?",
        "Where do you feel your program is underperforming? Inefficient?",
        "How do you minimize or avoid provider abrasion during HEDIS chart collection?",
        "Are the gaps identified by your quality analytics accurate enough to put in front of our providers?",
        "How are you prepared to adjust to unpredictable regulatory changes?",
        "Do you have or need the capability to create custom measures?"
    ],
    "Provider Enablement": [
        "How is your partnership with your providers?",
        "Do your providers understand the most valuable opportunities?",
        "How are you measuring provider performance?",
        "What sort of initiative does your team have to improve provider performance?",
        "How do you report on provider performance?",
        "How many programs do you/your plan manage?",
        "Does your team provide standard training for your providers?"
    ],
    "Converged Risk": [
        "Is your team/current vendor ensuring data accuracy and integrity -- How?",
        "Are you integrating Quality & Risk into a combined intervention plan?",
        "What kind of transparency do you get with your current vendor/internally?",
        "Where do you feel your program is underperforming? Inefficient?",
        "How confident are you that the administrative data is identifying the right conditions?",
        "How are you tailoring and adjusting to the complexities and differences between ACA vs Medicaid, and across national markets?",
        "Are your risk adjustment payments -- including your Transfer Payments (if ACA) -- where you expected?",
        "Do you have the transparency you need to ensure that the gaps you are addressing are accurate?",
        "Are you concerned about overcoding/undercoding? How does your team prepare for RADV audit?",
        "Do your analytics target both ongoing, chronic conditions and suspected conditions?",
        "If internal, does the health plan have the staff to scale?",
        "What is your ROI expectations?",
        "How does your team prioritize membership for intervention?",
        "Do you want/need more insight into the suspecting logic?"
    ],
    "Converged Outreach": [
        "How do you currently engage with members and providers?",
        "What sort of flexibility are you looking for when creating engagement strategies and plans?",
        "Are you able to deliver outreach plans to a multitude of modalities, seamlessly?",
        "Are you interested in creating customized outreach plans?",
        "What initiatives does your organization have regarding reducing member abrasion?",
        "How does your organization coalesce budget and strategic improvement goals for certain measures?",
        "Are you currently able to scale outreach/engagement operations based on seasonality?",
        "Can you/are you interested in closing Quality and Risk gaps, for a single member, at a single point of care?"
    ],
    "Electronic Record on Demand": [
        "What is your current process for retrieving patients' medical records? What is working/not working within that process?",
        "If you are currently getting electronic medical records directly from an EHR vendor, what do you do with the information once you receive back? How are you able to utilize it?",
        "Do you have an effective workflow integrating Medical Record data into your analytics?",
        "Are you looking to reduce the cost of chart collection?",
        "How does your team currently derive the discrete data from the medical records?"
    ]
};

const DiscoveryQuestions: React.FC = () => {
  const [prospectReports, setProspectReports] = useState<SavedReportData[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestionCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProspects = () => {
        const reports = getSavedReports();
        const prospectProfiles = reports.filter(r => r.moduleType === ModuleType.PROSPECT_PROFILE);
        setProspectReports(prospectProfiles);
    };
    
    fetchProspects(); // Initial fetch

    window.addEventListener('reports-updated', fetchProspects);
    return () => {
        window.removeEventListener('reports-updated', fetchProspects);
    };
  }, []);

  const handleGenerateAnswers = useCallback(async () => {
    if (!selectedReportId) return;

    const report = prospectReports.find(r => r.id === selectedReportId);
    if (!report) return;

    setIsLoading(true);
    setError(null);
    setAnsweredQuestions(null);

    try {
      const result = await answerDiscoveryQuestions(report, staticQuestions);
      setAnsweredQuestions(result);
    } catch (err) {
      setError('An error occurred while generating answers. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReportId, prospectReports]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-700">Analyzing Report...</h3>
          <p className="text-slate-500">The AI is reviewing the prospect profile to answer discovery questions. This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500 mt-4 text-center p-4 bg-red-50 rounded-md">{error}</p>;
    }

    const dataToRender = answeredQuestions || Object.entries(staticQuestions).map(([category, questions]) => ({
        category,
        questions: questions.map(q => ({ question: q, answer: '', status: 'NOT_FOUND' as const }))
    }));
    const isStatic = !answeredQuestions;

    return (
        <div className="animate-fade-in">
            {dataToRender.map(({ category, questions }) => (
                <details key={category} className="bg-white rounded-lg shadow-sm mb-4 open:ring-2 open:ring-sky-200 transition" open>
                    <summary className="text-lg font-semibold text-slate-700 p-4 cursor-pointer">{category}</summary>
                    <div className="p-4 border-t border-slate-200">
                        <ul className="space-y-4">
                            {questions.map((q, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    {isStatic ? (
                                        <div className="flex-shrink-0 h-6 w-6" /> // Placeholder for alignment
                                    ) : q.status === 'ANSWERED' ? (
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                    ) : (
                                        <QuestionCircleIcon className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-slate-800 font-medium">{q.question}</p>
                                        {!isStatic && q.status === 'ANSWERED' && (
                                            <div className="mt-2 p-3 bg-sky-50 border-l-4 border-sky-400 rounded-r-md">
                                                <p className="text-sm text-slate-700">{q.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            ))}
        </div>
    );
  };
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Discovery Questions</h2>
        <p className="text-slate-500">A knowledge base to guide your discovery calls. Select a prospect profile to auto-populate answers.</p>
         <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-end gap-2">
            <div className="flex-grow w-full">
                <label htmlFor="prospect-select" className="block text-sm font-medium text-slate-700 mb-1">Select Prospect Profile</label>
                <select 
                    id="prospect-select" 
                    value={selectedReportId} 
                    onChange={e => setSelectedReportId(e.target.value)} 
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    aria-label="Select Prospect Profile"
                >
                    <option value="">-- Select a report --</option>
                    {prospectReports.map(report => (
                        <option key={report.id} value={report.id}>{report.title}</option>
                    ))}
                </select>
            </div>
            <button 
                onClick={handleGenerateAnswers} 
                disabled={!selectedReportId || isLoading}
                className="flex items-center justify-center bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors w-full sm:w-auto flex-shrink-0"
            >
                {isLoading ? <Loader /> : 'Generate Answers'}
            </button>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default DiscoveryQuestions;