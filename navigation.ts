import React from 'react';
import { ModuleType } from './types';
import { HomeIcon } from './components/icons/HomeIcon';
import { ProspectIcon } from './components/icons/ProspectIcon';
import { CompetitorIcon } from './components/icons/CompetitorIcon';
import { KnowledgeIcon } from './components/icons/KnowledgeIcon';
import { SWOTIcon } from './components/icons/SWOTIcon';
import { LeadGenIcon } from './components/icons/LeadGenIcon';
import { ActivityIcon } from './components/icons/ActivityIcon';
import { LibraryIcon } from './components/icons/LibraryIcon';
import { RFPAnalyzerIcon } from './components/icons/RFPAnalyzerIcon';
import { MarketPulseIcon } from './components/icons/MarketPulseIcon';
import { FlaskIcon } from './components/icons/FlaskIcon';
import { PlaybookIcon } from './components/icons/PlaybookIcon';
import { QuestionMarkIcon } from './components/icons/QuestionMarkIcon';
import { DocumentDuplicateIcon } from './components/icons/DocumentDuplicateIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';

export interface NavItem {
    type: ModuleType;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface NavGroup {
    title: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'Dashboard',
    icon: HomeIcon,
    items: [{ type: ModuleType.HOME, icon: HomeIcon }],
  },
  {
    title: 'Prospecting',
    icon: ProspectIcon,
    items: [
      { type: ModuleType.LEAD_GENERATION, icon: LeadGenIcon },
      { type: ModuleType.PROSPECT_PROFILE, icon: ProspectIcon },
      { type: ModuleType.PROSPECT_BOOK, icon: BookOpenIcon },
    ],
  },
  {
    title: 'Deal Execution',
    icon: PlaybookIcon,
    items: [
      { type: ModuleType.DEAL_PLAYBOOK, icon: PlaybookIcon },
      { type: ModuleType.DISCOVERY_QUESTIONS, icon: QuestionMarkIcon },
    ],
  },
  {
    title: 'Market Intelligence',
    icon: MarketPulseIcon,
    items: [
      { type: ModuleType.MARKET_PULSE, icon: MarketPulseIcon },
      { type: ModuleType.COMPETITOR_MATRIX, icon: CompetitorIcon },
      { type: ModuleType.SWOT_ANALYSIS, icon: SWOTIcon },
    ],
  },
  {
    title: 'Internal Resources',
    icon: KnowledgeIcon,
    items: [
      { type: ModuleType.INTERNAL_KNOWLEDGE, icon: KnowledgeIcon },
      { type: ModuleType.RFP_ANALYZER, icon: RFPAnalyzerIcon },
      { type: ModuleType.PRODUCT_GAP_ANALYSIS, icon: FlaskIcon },
    ],
  },
  {
    title: 'Workspace',
    icon: LibraryIcon,
    items: [
      { type: ModuleType.ACTIVITY_DASHBOARD, icon: ActivityIcon },
      { type: ModuleType.REPORT_LIBRARY, icon: LibraryIcon },
      { type: ModuleType.REPORT_TEMPLATES, icon: DocumentDuplicateIcon },
    ],
  },
];