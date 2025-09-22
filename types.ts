import { ModuleType as AppModuleType } from './types';

export enum ModuleType {
  HOME = 'Home',
  PROSPECT_PROFILE = 'Prospect Profile Generator',
  LEAD_GENERATION = 'Lead Generation',
  PROSPECT_BOOK = 'Prospect Book',
  DEAL_PLAYBOOK = 'Deal Playbook',
  COMPETITOR_MATRIX = 'Competitor Intelligence Matrix',
  SWOT_ANALYSIS = 'SWOT Analysis',
  MARKET_PULSE = 'Market Pulse',
  DISCOVERY_QUESTIONS = 'Discovery Questions',
  INTERNAL_KNOWLEDGE = 'Internal Knowledge Search',
  RFP_ANALYZER = 'RFP & Security Analyzer',
  ACTIVITY_DASHBOARD = 'Activity Dashboard',
  REPORT_LIBRARY = 'Report Library',
  PRODUCT_GAP_ANALYSIS = 'Product Gap Analysis',
  REPORT_TEMPLATES = 'Report Templates',
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
  uri?: string;
  isImpactful?: boolean;
}

export interface ReportData {
  title: string;
  content: string;
  citations: Citation[];
  moduleType?: ModuleType;
  executiveSummary?: string;
  financialSummary?: string;
  orgChartData?: TeamMember[];
  keyStats?: KeyStats;
  challengesAndInitiatives?: ChallengeOrInitiative[];
  technologyFootprint?: string[];
  recentNews?: NewsItem[];
  qualityIntelligence?: string;
  riskIntelligence?: string;
  careModelsIntelligence?: string;
  pharmacyIntelligence?: string;
  hospitalNetworksIntelligence?: string;
  employerGroupsIntelligence?: string;
}

export interface SavedReportData extends ReportData {
  id: string;
  savedAt: string;
}

// --- NEW Collaboration Models ---
export interface User {
  id: string;
  name: string;
  avatarUrl: string; // e.g., https://picsum.photos/seed/{id}/40/40
}

export interface Team {
  id: string;
  name: string;
  members: User[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}
// --- END NEW Collaboration Models ---


export interface ProspectBookData extends ReportData {
  prospectName: string; // This is the unique key
  createdAt: string;
  updatedAt: string;
  notes?: string;

  // --- ADDED for Collaboration ---
  ownerId?: string; // ID of the user who created it
  teamId?: string; // ID of the team it belongs to
  access?: 'private' | 'team'; // Who can see it
  sharedWith?: { user: User; role: 'viewer' | 'editor' }[]; // Specific users it's shared with
  comments?: Comment[]; // In-context comments
}


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

export type SearchFocus = 'ALL_WEB' | 'CLINICAL' | 'FINANCIAL' | 'NEWS';

export interface MarketResearchResult {
  answer: string;
  relatedQuestions: string[];
  citations: Citation[];
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

export interface PlaybookData {
    prospectName?: string;
    currentClient?: 'yes' | 'no';
    opportunityIdentified?: string;
    painPoints?: string;
    clientGoals?: string;
    businessCase?: string;
    competitors?: string;
    storyTelling?: string;
    keyTakeaways?: string;
    questionsAsked?: string;
    wowFactors?: string;
    followUpCommunication?: string;
    nextSteps?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
  isDefault?: boolean;
  job?: string;
  icon?: string;
}

export interface WatchlistItem {
  id: string;
  name: string;
  type: 'PROSPECT' | 'COMPETITOR' | 'CLIENT';
}

export type AlertType = 'FINANCIAL' | 'LEADERSHIP' | 'CLINICAL' | 'PRODUCT' | 'GENERAL';

export interface WatchlistAlert {
  id: string;
  watchlistItemId: string;
  watchlistItemName: string;
  timestamp: string;
  type: AlertType;
  title: string;
  summary: string;
  source: {
    uri: string;
    title: string;
  };
}