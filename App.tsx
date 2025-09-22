
import React, { useState, useCallback } from 'react';
import { ModuleType, ReportData } from './types';
import { NavGroup, navGroups } from './navigation';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Launchpad from './components/Launchpad';
import ProspectProfileGenerator from './components/ProspectProfileGenerator';
import CompetitorMatrix from './components/CompetitorMatrix';
import InternalSearch from './components/InternalSearch';
import SWOTAnalysisGenerator from './components/SWOTAnalysisGenerator';
import LeadGeneration from './components/LeadGeneration';
import ActivityDashboard from './components/ActivityDashboard';
import ReportLibrary from './components/ReportLibrary';
import RFPAnalyzer from './components/RFPAnalyzer';
import MarketPulse from './components/MarketPulse';
import ProductGapReport from './components/ProductGapReport';
import DealPlaybook from './components/DealPlaybook';
import DiscoveryQuestions from './components/DiscoveryQuestions';
import Home from './components/Home';
import ReportTemplates from './components/ReportTemplates';
import ProspectBook from './components/ProspectBook';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.HOME);
  const [initialProspectForProfile, setInitialProspectForProfile] = useState<string>('');
  const [initialProspectForBook, setInitialProspectForBook] = useState<string>('');
  const [initialReportForPlaybook, setInitialReportForPlaybook] = useState<ReportData | null>(null);
  const [activeLaunchpadGroup, setActiveLaunchpadGroup] = useState<NavGroup | null>(null);


  const handleGenerateProfileForLead = useCallback((prospectName: string) => {
    setInitialProspectForProfile(prospectName);
    setActiveModule(ModuleType.PROSPECT_PROFILE);
  }, []);

  const handleBookGenerated = useCallback((prospectName: string) => {
    setInitialProspectForBook(prospectName);
    setActiveModule(ModuleType.PROSPECT_BOOK);
  }, []);
  
  const handleStartPlaybook = useCallback((report: ReportData) => {
    setInitialReportForPlaybook(report);
    setActiveModule(ModuleType.DEAL_PLAYBOOK);
    // Reset after a short delay to allow DealPlaybook to consume the prop
    setTimeout(() => setInitialReportForPlaybook(null), 500);
  }, []);

  const handleWatchlistAction = useCallback((action: { type: string, payload: any }) => {
    if (action.type === 'REFRESH_PROFILE') {
      handleGenerateProfileForLead(action.payload);
    }
    // Future actions like 'UPDATE_PLAYBOOK' can be added here
  }, [handleGenerateProfileForLead]);

  const handleSetActiveModule = (module: ModuleType) => {
    if (module === ModuleType.PROSPECT_PROFILE) {
      setInitialProspectForProfile(''); // Reset when navigating directly to a blank profile
    }
    if(module === ModuleType.PROSPECT_BOOK) {
      setInitialProspectForBook(''); // Reset when navigating directly
    }
    setActiveModule(module);
    setActiveLaunchpadGroup(null); // Close launchpad on selection
  };


  const renderActiveModule = useCallback(() => {
    switch (activeModule) {
      case ModuleType.HOME:
        return <Home setActiveModule={handleSetActiveModule} />;
      case ModuleType.PROSPECT_PROFILE:
        return <ProspectProfileGenerator key={initialProspectForProfile || 'default'} initialProspectName={initialProspectForProfile} onBookGenerated={handleBookGenerated} />;
      case ModuleType.PROSPECT_BOOK:
        return <ProspectBook key={initialProspectForBook || 'default'} initialProspectName={initialProspectForBook} onStartPlaybook={handleStartPlaybook} />;
      case ModuleType.LEAD_GENERATION:
        return <LeadGeneration onGenerateProfile={handleGenerateProfileForLead} />;
      case ModuleType.DEAL_PLAYBOOK:
        return <DealPlaybook initialReport={initialReportForPlaybook} />;
      case ModuleType.COMPETITOR_MATRIX:
        return <CompetitorMatrix />;
      case ModuleType.SWOT_ANALYSIS:
        return <SWOTAnalysisGenerator />;
      case ModuleType.MARKET_PULSE:
        return <MarketPulse onTriggerAction={handleWatchlistAction} />;
      case ModuleType.DISCOVERY_QUESTIONS:
        return <DiscoveryQuestions />;
      case ModuleType.INTERNAL_KNOWLEDGE:
        return <InternalSearch />;
      case ModuleType.RFP_ANALYZER:
        return <RFPAnalyzer />;
      case ModuleType.PRODUCT_GAP_ANALYSIS:
        return <ProductGapReport />;
      case ModuleType.ACTIVITY_DASHBOARD:
        return <ActivityDashboard />;
      case ModuleType.REPORT_LIBRARY:
        return <ReportLibrary onStartPlaybook={handleStartPlaybook} />;
      case ModuleType.REPORT_TEMPLATES:
        return <ReportTemplates />;
      default:
        return <Home setActiveModule={handleSetActiveModule} />;
    }
  }, [activeModule, initialProspectForProfile, handleGenerateProfileForLead, handleStartPlaybook, initialReportForPlaybook, handleWatchlistAction, handleBookGenerated, initialProspectForBook]);

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* --- Desktop Sidebar --- */}
      <div className="hidden md:flex">
        <Sidebar 
          activeModule={activeModule} 
          setActiveModule={handleSetActiveModule}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {renderActiveModule()}
        </div>
      </main>

      {/* --- Mobile Navigation --- */}
      <div className="md:hidden">
        <MobileNav 
          navGroups={navGroups} 
          onOpenLaunchpad={setActiveLaunchpadGroup} 
          onNavigate={handleSetActiveModule}
        />
        <Launchpad 
          group={activeLaunchpadGroup}
          onClose={() => setActiveLaunchpadGroup(null)}
          onSelectModule={handleSetActiveModule}
        />
      </div>
    </div>
  );
};

export default App;