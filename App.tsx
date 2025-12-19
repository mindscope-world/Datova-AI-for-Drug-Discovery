import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MoleculeViewer from './components/MoleculeViewer';
import DockingAnalysis from './components/DockingAnalysis';
import Generator from './components/Generator';
import JobMonitor from './components/JobMonitor';
import { ViewState } from './types';
import { FolderKanban } from 'lucide-react';
import { MOCK_PROJECTS } from './constants';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard setView={setView} />;
      case ViewState.MOLECULES:
        return <MoleculeViewer />;
      case ViewState.DOCKING:
        return <DockingAnalysis setView={setView} />;
      case ViewState.GENERATOR:
        return <Generator />;
      case ViewState.JOBS:
        return <JobMonitor />;
      case ViewState.PROJECTS:
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PROJECTS.map(proj => (
                        <div key={proj.id} className="group cursor-pointer rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-primary/50 hover:bg-surfaceHighlight">
                             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FolderKanban className="h-6 w-6" />
                             </div>
                             <h3 className="mb-2 text-lg font-semibold text-white">{proj.name}</h3>
                             <p className="mb-4 text-sm text-slate-400">{proj.description}</p>
                             <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500">
                                <span>{proj.moleculeCount} molecules</span>
                                <span className={`uppercase ${proj.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>{proj.status}</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );
      default:
        return <div className="text-white">View Not Implemented</div>;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;