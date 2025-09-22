import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReportData, ModuleType, SavedReportData } from '../types';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintIcon } from './icons/PrintIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ExportIcon } from './icons/ExportIcon';
import Loader from './Loader';
import MeetingPrepModal from './MeetingPrepModal';
import { EmailIcon } from './icons/EmailIcon';
import OutreachModal from './OutreachModal';
import OrgChart from './OrgChart';
import KeyStatsBanner from './KeyStatsBanner';
import ChallengesAndInitiatives from './ChallengesAndInitiatives';
import TechnologyFootprint from './TechnologyFootprint';
import NewsTimeline from './NewsTimeline';
import { PlaybookIcon } from './icons/PlaybookIcon';
import ExecutiveSummary from './ExecutiveSummary';
import FinancialSummary from './FinancialSummary';
import DomainIntelligenceView from './DomainIntelligenceView';
import { updateReport } from '../services/reportStore';
import { IntelligenceDomain } from '../services/geminiService';
import TextSelectionToolbar from './TextSelectionToolbar';
import AiActionModal from './AiActionModal';

interface ReportViewProps {
  report: SavedReportData;
  onStartPlaybook?: (report: ReportData) => void;
}

const TABS = [
    { key: 'overview', title: 'Overview' },
    { key: 'quality', title: 'Quality Intelligence', domain: 'Quality', contentKey: 'qualityIntelligence' },
    { key: 'risk', title: 'Risk Intelligence', domain: 'Risk', contentKey: 'riskIntelligence' },
    { key: 'care-models', title: 'Care Models', domain: 'Care Models', contentKey: 'careModelsIntelligence' },
    { key: 'pharmacy', title: 'Pharmacy', domain: 'Pharmacy', contentKey: 'pharmacyIntelligence' },
    { key: 'hospital-networks', title: 'Hospital Networks', domain: 'Hospital Networks', contentKey: 'hospitalNetworksIntelligence' },
    { key: 'employer-groups', title: 'Employer Groups', domain: 'Employer Groups', contentKey: 'employerGroupsIntelligence' },
] as const;

type ReportTabKey = typeof TABS[number]['key'];
type AiActionType = 'explain' | 'point' | 'snippet';


const ReportView: React.FC<ReportViewProps> = ({ report, onStartPlaybook }) => {
  const [currentReport, setCurrentReport] = useState<SavedReportData>(report);
  const [activeTab, setActiveTab] = useState<ReportTabKey>('overview');
  const reportContentRef = useRef<HTMLDivElement>(null);
  const reportBodyRef = useRef<HTMLDivElement>(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // State for interactive report feature
  const [selectionState, setSelectionState] = useState<{ text: string; position: { top: number; left: number } | null }>({ text: '', position: null });
  const [activeAiAction, setActiveAiAction] = useState<AiActionType | null>(null);

  const parsedContent = marked(currentReport.content, { gfm: true, breaks: true });
  
  const handleSelection = useCallback(() => {
    if (currentReport.moduleType !== ModuleType.PROSPECT_PROFILE) return;

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';

    if (selectedText.length > 10) { 
        const range = selection?.getRangeAt(0);
        if (range) {
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0) {
                 setSelectionState({
                    text: selectedText,
                    position: {
                        top: rect.top + window.scrollY - 50,
                        left: rect.left + window.scrollX + rect.width / 2,
                    },
                });
                return;
            }
        }
    }
    
    if (!activeAiAction) {
      setSelectionState({ text: '', position: null });
    }
  }, [currentReport.moduleType, activeAiAction]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (reportBodyRef.current && !reportBodyRef.current.contains(event.target as Node)) {
             setSelectionState({ text: '', position: null });
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAiAction = (action: AiActionType) => {
    setActiveAiAction(action);
    setSelectionState(prev => ({ ...prev, position: null }));
  };

  const handleCloseAiModal = () => {
    setActiveAiAction(null);
  };

  const handleDomainContentLoaded = (contentKey: keyof ReportData, content: string) => {
    const update = { [contentKey]: content };
    
    if (currentReport.id) {
        updateReport(currentReport.id, update);
    }
    setCurrentReport(prev => ({ ...prev, ...update }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && reportContentRef.current) {
      const reportHtml = reportContentRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>${currentReport.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body class="p-8 font-sans">
            ${reportHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = () => {
    const url = window.location.href; // Placeholder for a real shareable link
    navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy link.');
    });
  };
  
  const handleExportPDF = async () => {
    if (!reportContentRef.current) return;
    
    setIsExporting(true);
    try {
        const canvas = await html2canvas(reportContentRef.current, {
            scale: 2, // Increase resolution
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        const fileName = `${currentReport.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("Error exporting PDF:", error);
        alert("An error occurred while exporting the report to PDF.");
    } finally {
        setIsExporting(false);
    }
  };

  const renderTabContent = () => {
      const tabConfig = TABS.find(t => t.key === activeTab);

      if (activeTab === 'overview' || !tabConfig) {
        return (
            <>
                {currentReport.executiveSummary && <ExecutiveSummary summary={currentReport.executiveSummary} />}
                {currentReport.keyStats && <KeyStatsBanner stats={currentReport.keyStats} />}
                {currentReport.orgChartData && currentReport.orgChartData.length > 0 && (
                    <OrgChart data={currentReport.orgChartData} />
                )}
                {currentReport.financialSummary && <FinancialSummary summary={currentReport.financialSummary} />}
                {currentReport.challengesAndInitiatives && currentReport.challengesAndInitiatives.length > 0 && (
                    <ChallengesAndInitiatives report={currentReport} />
                )}
                {currentReport.technologyFootprint && currentReport.technologyFootprint.length > 0 && (
                    <TechnologyFootprint tech={currentReport.technologyFootprint} />
                )}
                {currentReport.recentNews && currentReport.recentNews.length > 0 && (
                    <NewsTimeline newsItems={currentReport.recentNews} />
                )}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-700 mb-4">Full Detailed Report</h3>
                    <div
                        className="prose prose-slate max-w-none prose-headings:font-bold prose-h3:text-xl prose-h4:text-lg prose-a:text-sky-600 hover:prose-a:text-sky-700 prose-strong:text-slate-800 prose-li:my-1 prose-table:table-auto prose-table:w-full prose-thead:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-slate-200"
                        dangerouslySetInnerHTML={{ __html: parsedContent as string }}
                    />
                </div>
            </>
        );
      }

      // Check if it's a domain intelligence tab
      if ('domain' in tabConfig) {
          // FIX: The contentKey is always a key of the base ReportData, not the extended SavedReportData.
          // This resolves the type mismatch when passing contentKey to handleDomainContentLoaded.
          const domainTab = tabConfig as { key: string, title: string, domain: IntelligenceDomain, contentKey: keyof ReportData };
          return (
            <DomainIntelligenceView 
                prospectName={currentReport.title.replace('Prospect Profile: ', '')}
                domain={domainTab.domain}
                existingContent={currentReport[domainTab.contentKey] as string | undefined}
                reportContext={currentReport.content}
                onContentLoaded={(content) => handleDomainContentLoaded(domainTab.contentKey, content)}
            />
          );
      }

      return null;
  }

  return (
    <>
      {selectionState.position && (
        <TextSelectionToolbar
            top={selectionState.position.top}
            left={selectionState.position.left}
            onAction={handleAiAction}
        />
      )}
      {activeAiAction && (
        <AiActionModal
            action={activeAiAction}
            selectedText={selectionState.text}
            onClose={handleCloseAiModal}
        />
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in" >
        <div ref={reportContentRef}>
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-slate-800">{currentReport.title}</h2>
                <div className="flex gap-2 no-print">
                 {currentReport.moduleType === ModuleType.PROSPECT_PROFILE && (
                    <>
                      <button onClick={() => setIsOutreachModalOpen(true)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors" title="Draft Outreach Email">
                          <EmailIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => setIsPrepModalOpen(true)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors" title="Prepare for Meeting">
                          <BriefcaseIcon className="h-5 w-5" />
                      </button>
                    </>
                 )}
                <button onClick={handleExportPDF} disabled={isExporting} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors disabled:cursor-not-allowed" title="Export as PDF">
                   {isExporting ? <Loader /> : <ExportIcon className="h-5 w-5" />}
                </button>
                <button onClick={handleShare} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors" title={isCopied ? "Link Copied!" : "Share Report"}>
                    <ShareIcon className={`h-5 w-5 transition-colors ${isCopied ? 'text-green-500' : ''}`} />
                </button>
                <button onClick={handlePrint} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors" title="Print Report">
                    <PrintIcon className="h-5 w-5" />
                </button>
                </div>
            </div>

            {currentReport.moduleType === ModuleType.PROSPECT_PROFILE && onStartPlaybook && (
                <div className="no-print mb-8">
                    <button
                        onClick={() => onStartPlaybook(currentReport)}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600 disabled:bg-slate-300 transition-colors text-base"
                    >
                        <PlaybookIcon className="h-5 w-5" />
                        Start Deal Playbook
                    </button>
                </div>
            )}
            
            {/* --- TABS --- */}
             {currentReport.moduleType === ModuleType.PROSPECT_PROFILE && (
                <div className="mb-8 border-b border-slate-200 no-print">
                    <div className="overflow-x-auto pb-1">
                      <nav className="-mb-px flex space-x-6">
                          {TABS.map(tab => (
                              <button
                                  key={tab.key}
                                  onClick={() => setActiveTab(tab.key)}
                                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                      activeTab === tab.key
                                      ? 'border-sky-500 text-sky-600'
                                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                  }`}
                              >
                                  {tab.title}
                              </button>
                          ))}
                      </nav>
                    </div>
                </div>
            )}
            
            {/* --- TAB CONTENT --- */}
            <div className="report-content-body" onMouseUp={handleSelection} ref={reportBodyRef}>
                {renderTabContent()}
            </div>
            
            {/* --- CITATIONS (Common to all tabs) --- */}
            {currentReport.citations.length > 0 && (
                <div className="mt-12 pt-6 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Sources</h3>
                <ul className="space-y-2">
                    {currentReport.citations.map((citation, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 bg-slate-200 text-slate-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mt-1">
                        {index + 1}
                        </span>
                        <a
                        href={citation.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:underline break-all"
                        >
                        {citation.title || citation.uri}
                        </a>
                    </li>
                    ))}
                </ul>
                </div>
            )}
        </div>
      </div>
      {isPrepModalOpen && (
        <MeetingPrepModal
          report={currentReport}
          onClose={() => setIsPrepModalOpen(false)}
        />
      )}
      {isOutreachModalOpen && (
        <OutreachModal
          report={currentReport}
          onClose={() => setIsOutreachModalOpen(false)}
        />
      )}
    </>
  );
};

export default ReportView;