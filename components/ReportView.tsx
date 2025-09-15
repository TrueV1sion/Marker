import React, { useState, useRef } from 'react';
import { ReportData, ModuleType } from '../types';
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

interface ReportViewProps {
  report: ReportData;
}

const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const parsedContent = marked(report.content, { gfm: true, breaks: true });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && reportContentRef.current) {
      const reportHtml = reportContentRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
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

        const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("Error exporting PDF:", error);
        alert("An error occurred while exporting the report to PDF.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in" >
        <div ref={reportContentRef}>
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-slate-800">{report.title}</h2>
                <div className="flex gap-2 no-print">
                 {report.moduleType === ModuleType.PROSPECT_PROFILE && (
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

            <div
                className="prose prose-slate max-w-none prose-headings:font-bold prose-h3:text-xl prose-h4:text-lg prose-a:text-sky-600 hover:prose-a:text-sky-700 prose-strong:text-slate-800 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: parsedContent as string }}
            />

            {report.citations.length > 0 && (
                <div className="mt-12 pt-6 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Sources</h3>
                <ul className="space-y-2">
                    {report.citations.map((citation, index) => (
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
          report={report}
          onClose={() => setIsPrepModalOpen(false)}
        />
      )}
      {isOutreachModalOpen && (
        <OutreachModal
          report={report}
          onClose={() => setIsOutreachModalOpen(false)}
        />
      )}
    </>
  );
};

export default ReportView;
