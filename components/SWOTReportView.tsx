
import React, { useState, useMemo, useRef } from 'react';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportData } from '../types';
import Loader from './Loader';
import { PrintIcon } from './icons/PrintIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ExportIcon } from './icons/ExportIcon';

interface SWOTReportViewProps {
  report: ReportData;
}

interface SWOTDataParsed {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

const SWOTReportView: React.FC<SWOTReportViewProps> = ({ report }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const parsedSWOT: SWOTDataParsed | null = useMemo(() => {
    if (!report?.content) return null;

    const content = report.content;
    const sections: SWOTDataParsed = {
      strengths: 'Not available.',
      weaknesses: 'Not available.',
      opportunities: 'Not available.',
      threats: 'Not available.',
    };

    const extractSection = (start: string, end?: string) => {
        const regex = end 
            ? new RegExp(`\\*\\*${start}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*${end}\\*\\*)`, 'i')
            : new RegExp(`\\*\\*${start}\\*\\*\\s*([\\s\\S]*)`, 'i');
        const match = content.match(regex);
        return match ? marked(match[1].trim(), { gfm: true, breaks: true }) as string : 'Not available.';
    }

    sections.strengths = extractSection('Strengths', 'Weaknesses');
    sections.weaknesses = extractSection('Weaknesses', 'Opportunities');
    sections.opportunities = extractSection('Opportunities', 'Threats');
    sections.threats = extractSection('Threats');

    return sections;
  }, [report]);

  const handleShare = () => {
    const url = window.location.href; // Placeholder
    navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handlePrint = () => {
     const printWindow = window.open('', '_blank');
    if (printWindow && reportContentRef.current) {
      const reportHtml = reportContentRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>${report?.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>@media print { .no-print { display: none; } }</style>
          </head>
          <body class="p-8 font-sans">${reportHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const handleExportPDF = async () => {
    if (!reportContentRef.current) return;
    
    setIsExporting(true);
    try {
        const canvas = await html2canvas(reportContentRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(`${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } finally {
        setIsExporting(false);
    }
  };

  if (!parsedSWOT) return null;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in" ref={reportContentRef}>
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-slate-800">{report.title}</h2>
            <div className="flex gap-2 no-print">
                <button onClick={handleExportPDF} disabled={isExporting} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors disabled:cursor-not-allowed" title="Export as PDF">
                   {isExporting ? <Loader /> : <ExportIcon className="h-5 w-5" />}
                </button>
                <button onClick={handleShare} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors" title={isCopied ? "Link Copied!" : "Share Analysis"}>
                    <ShareIcon className={`h-5 w-5 transition-colors ${isCopied ? 'text-green-500' : ''}`} />
                </button>
                <button onClick={handlePrint} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors" title="Print Analysis">
                    <PrintIcon className="h-5 w-5" />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="text-xl font-bold text-green-800 mb-2">Strengths</h3>
                <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: parsedSWOT.strengths }} />
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <h3 className="text-xl font-bold text-red-800 mb-2">Weaknesses</h3>
                <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: parsedSWOT.weaknesses }} />
            </div>
            <div className="bg-sky-50 border-l-4 border-sky-500 p-4 rounded-r-lg">
                <h3 className="text-xl font-bold text-sky-800 mb-2">Opportunities</h3>
                <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: parsedSWOT.opportunities }} />
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <h3 className="text-xl font-bold text-amber-800 mb-2">Threats</h3>
                <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: parsedSWOT.threats }} />
            </div>
        </div>

        {report.citations.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Sources</h3>
                <ul className="space-y-2">
                    {report.citations.map((citation, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 bg-slate-200 text-slate-600 text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mt-1">{index + 1}</span>
                        <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline break-all">{citation.title || citation.uri}</a>
                    </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};

export default SWOTReportView;
