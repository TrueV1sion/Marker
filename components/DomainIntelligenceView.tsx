import React, { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { generateDomainIntelligence, IntelligenceDomain } from '../services/geminiService';
import { GaugeIcon } from './icons/GaugeIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { KeyIcon } from './icons/KeyIcon';

interface DomainIntelligenceViewProps {
  prospectName: string;
  domain: IntelligenceDomain;
  existingContent?: string;
  reportContext: string;
  onContentLoaded: (content: string) => void;
}

interface IntelligenceCardProps {
    title: string;
    content: string;
    icon: React.ReactElement<{ className?: string }>;
    borderColor: string;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
}

const IntelligenceCard: React.FC<IntelligenceCardProps> = ({ title, content, icon, borderColor, bgColor, textColor, iconBgColor }) => {
    if (!content.trim()) return null;

    const parsedContent = marked(content, { gfm: true, breaks: true });
    return (
        <div className={`border-l-4 ${borderColor} ${bgColor} p-6 rounded-r-lg shadow-sm h-full flex flex-col`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`flex-shrink-0 ${iconBgColor} rounded-full p-2`}>
                    {React.cloneElement(icon, { className: `h-6 w-6 ${textColor}` })}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            </div>
            <div 
                className="prose prose-sm max-w-none prose-slate prose-li:my-1 flex-grow" 
                dangerouslySetInnerHTML={{ __html: parsedContent as string }} 
            />
        </div>
    );
};


interface ParsedIntelligence {
    overview: { title: string; content: string } | null;
    pain: { title: string; content: string } | null;
    opportunity: { title: string; content: string } | null;
}

const parseIntelligenceContent = (rawContent: string): ParsedIntelligence => {
    const result: ParsedIntelligence = { overview: null, pain: null, opportunity: null };

    // Regex to find headers like **Title** or ### Title, capturing the title and the following content.
    const sections = rawContent.split(/(^\s*(?:\*\*|###)\s*.*?\s*(?:\*\*|###)\s*$)/im);

    // If no markdown headers are found, treat the whole thing as a single overview block.
    if (sections.length <= 1) {
        return { overview: { title: "Intelligence Briefing", content: rawContent }, pain: null, opportunity: null };
    }

    for (let i = 1; i < sections.length; i += 2) {
        const title = sections[i].replace(/\*|#/g, '').trim();
        const content = sections[i + 1] ? sections[i + 1].trim() : '';
        const lowerTitle = title.toLowerCase();
        
        const keywords = {
            overview: ['current performance', 'risk program footprint', 'key care delivery programs', 'pharmacy strategy overview', 'provider network overview', 'commercial offerings'],
            pain: ['inferred pain points'],
            opportunity: ['strategic opportunities']
        };

        if (keywords.overview.some(kw => lowerTitle.includes(kw))) {
            result.overview = { title, content };
        } else if (keywords.pain.some(kw => lowerTitle.includes(kw))) {
            result.pain = { title, content };
        } else if (keywords.opportunity.some(kw => lowerTitle.includes(kw))) {
            result.opportunity = { title, content };
        }
    }
    
    // If parsing only finds pain/opportunity but no overview, it means the first section was the overview without a proper header.
    if (!result.overview && sections[0].trim().length > 0) {
        result.overview = { title: "Intelligence Overview", content: sections[0].trim() };
    }
    
    return result;
}


const DomainIntelligenceView: React.FC<DomainIntelligenceViewProps> = ({
  prospectName,
  domain,
  existingContent,
  reportContext,
  onContentLoaded,
}) => {
  const [content, setContent] = useState<string | null>(existingContent || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateContent = async () => {
      if (!existingContent) {
        setIsLoading(true);
        setError(null);
        try {
          const result = await generateDomainIntelligence(prospectName, domain, reportContext);
          setContent(result);
          onContentLoaded(result);
        } catch (err) {
          setError(`Failed to generate ${domain} Intelligence. Please try again later.`);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
          setContent(existingContent);
      }
    };

    generateContent();
  }, [prospectName, domain, existingContent, reportContext, onContentLoaded]);
  
  const parsed = useMemo(() => {
    if (!content) return { overview: null, pain: null, opportunity: null };
    return parseIntelligenceContent(content);
  }, [content]);

  if (isLoading) {
    return (
      <div className="text-center p-8 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-700">Generating {domain} Intelligence Briefing...</h3>
        <p className="text-slate-500">This may take a moment as the AI performs a deep analysis.</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 p-4 bg-red-50 rounded-md">{error}</p>;
  }
  
  if (!content) {
      return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
                {parsed.overview && (
                    <IntelligenceCard
                        title={parsed.overview.title}
                        content={parsed.overview.content}
                        icon={<GaugeIcon />}
                        borderColor="border-sky-500"
                        bgColor="bg-sky-50"
                        textColor="text-sky-700"
                        iconBgColor="bg-sky-200"
                    />
                )}
            </div>
            
            {parsed.pain ? (
                 <IntelligenceCard
                    title={parsed.pain.title}
                    content={parsed.pain.content}
                    icon={<ExclamationTriangleIcon />}
                    borderColor="border-amber-500"
                    bgColor="bg-amber-50"
                    textColor="text-amber-700"
                    iconBgColor="bg-amber-200"
                />
            ) : <div />} 
            
            {parsed.opportunity ? (
                 <IntelligenceCard
                    title={parsed.opportunity.title}
                    content={parsed.opportunity.content}
                    icon={<KeyIcon />}
                    borderColor="border-green-500"
                    bgColor="bg-green-50"
                    textColor="text-green-700"
                    iconBgColor="bg-green-200"
                />
            ) : <div />}
        </div>
    </div>
);
};

export default DomainIntelligenceView;