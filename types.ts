import { ModuleType as AppModuleType } from './types';

export enum ModuleType {
  PROSPECT_PROFILE = 'Prospect Profile Generator',
  LEAD_GENERATION = 'Lead Generation',
  COMPETITOR_MATRIX = 'Competitor Intelligence Matrix',
  SWOT_ANALYSIS = 'SWOT Analysis',
  MARKET_PULSE = 'Market Pulse',
  INTERNAL_KNOWLEDGE = 'Internal Knowledge Search',
  RFP_ANALYZER = 'RFP & Security Analyzer',
  ACTIVITY_DASHBOARD = 'Activity Dashboard',
  REPORT_LIBRARY = 'Report Library',
  PRODUCT_GAP_ANALYSIS = 'Product Gap Analysis',
}

export enum ActivityType {
  GENERATION = 'GENERATION',
  OUTREACH = 'OUTREACH',
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ActivityType;
  module: ModuleType | string; // ModuleType for generations, string for others like outreach
  details: {
    primary: string; // e.g., Prospect Name, Company Name
    secondary?: string; // e.g., Persona and Tone for outreach
  };
}


export interface Citation {
  uri: string;
  title: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  linkedin?: string;
}

export interface KeyStats {
  companySize?: string;
  annualRevenue?: string;
  primaryFocus?: string;
}

export interface ChallengeOrInitiative {
  type: 'challenge' | 'initiative';
  description: string;
}

export interface NewsItem {
  date: string;
  headline: string;
}

export interface ReportData {
  title: string;
  content: string;
  citations: Citation[];
  moduleType?: ModuleType;
  orgChartData?: TeamMember[];
  keyStats?: KeyStats;
  challengesAndInitiatives?: ChallengeOrInitiative[];
  technologyFootprint?: string[];
  recentNews?: NewsItem[];
}

export interface SavedReportData extends ReportData {
  id: string;
  savedAt: string;
}

// FIX: Made web property and its nested properties optional to match @google/genai types.
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface Lead {
  companyName: string;
  reason: string;
}

export interface LeadGenerationResult {
  leads: Lead[];
  citations: Citation[];
}

export interface EmailData {
  subject: string;
  body: string;
}

export interface RFPRequirement {
  requirement: string;
  suggestedAnswer: string;
  status: 'ANSWERED' | 'GAP';
}
export interface RFPAnalysisResult {
  analysis: RFPRequirement[];
}

export interface MarketTrend {
  title: string;
  summary: string;
  uri: string;
}

export interface MarketPulseSummary {
  thisYear: string[];
  lastQuarter: string[];
  lastMonth: string[];
  lastWeek: string[];
  lookingAhead: string[];
}

export type UserPersona = 'Sales Development Rep' | 'Account Executive' | 'Sales Leadership' | 'Market Analyst';

export interface TalkingPointsResult {
    isGap: boolean;
    talkingPoints: string;
    gapAnalysis: string;
    newSolutionIdea?: string;
}

export interface ProductGap {
  id: string;
  savedAt: string;
  prospectName: string;
  challengeDescription: string;
  gapAnalysis: string;
  newSolutionIdea: string;
}