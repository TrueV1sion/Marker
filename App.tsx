
import React, { useState, useCallback } from 'react';
import { ModuleType, ReportData } from './types';
import Sidebar from './components/Sidebar';
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
import { HeliosLogo } from './components/icons/HeliosLogo';
import Home from './components/Home';
import ReportTemplates from './components/ReportTemplates';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.HOME);
  const [initialProspect, setInitialProspect] = useState<string>('');
  const [initialReportForPlaybook, setInitialReportForPlaybook] = useState<ReportData | null>(null);

  const handleGenerateProfileForLead = useCallback((prospectName: string) => {
    setInitialProspect(prospectName);
    setActiveModule(ModuleType.PROSPECT_PROFILE);
  }, []);
  
  const handleStartPlaybook = useCallback((report: ReportData) => {
    setInitialReportForPlaybook(report);
    setActiveModule(ModuleType.DEAL_PLAYBOOK);
    // Reset after a short delay to allow DealPlaybook to consume the prop
    setTimeout(() => setInitialReportForPlaybook(null), 500);
  }, []);

  const handleSetActiveModule = (module: ModuleType) => {
    if (module === ModuleType.PROSPECT_PROFILE) {
      setInitialProspect(''); // Reset when navigating directly to a blank profile
    }
    setActiveModule(module);
  };


  const renderActiveModule = useCallback(() => {
    switch (activeModule) {
      case ModuleType.HOME:
        return <Home setActiveModule={handleSetActiveModule} />;
      case ModuleType.PROSPECT_PROFILE:
        // Use a key to force re-mount when initialProspect changes, ensuring state is fresh
        return <ProspectProfileGenerator key={initialProspect || 'default'} initialProspectName={initialProspect} onStartPlaybook={handleStartPlaybook} />;
      case ModuleType.LEAD_GENERATION:
        return <LeadGeneration onGenerateProfile={handleGenerateProfileForLead} />;
      case ModuleType.DEAL_PLAYBOOK:
        return <DealPlaybook initialReport={initialReportForPlaybook} />;
      case ModuleType.COMPETITOR_MATRIX:
        return <CompetitorMatrix />;
      case ModuleType.SWOT_ANALYSIS:
        return <SWOTAnalysisGenerator />;
      case ModuleType.MARKET_PULSE:
        return <MarketPulse />;
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
  }, [activeModule, initialProspect, handleGenerateProfileForLead, handleStartPlaybook, initialReportForPlaybook]);

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar activeModule={activeModule} setActiveModule={handleSetActiveModule} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <HeliosLogo className="h-8 w-8 text-sky-500" />
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Helios</h1>
                    <p className="text-sm text-slate-500">Healthcare Intelligence & Opportunity Engine</p>
                </div>
            </div>
        </header>
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderActiveModule()}
        </div>
      </main>
    </div>
  );
};

export default App;
