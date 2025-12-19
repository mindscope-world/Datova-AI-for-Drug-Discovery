import React from 'react';
import { LayoutDashboard, FolderKanban, Dna, Activity, Zap, Cpu, Settings, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  onSettings?: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onSettings, onLogout }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.PROJECTS, label: 'Projects', icon: FolderKanban },
    { id: ViewState.MOLECULES, label: 'Molecule Library', icon: Dna },
    { id: ViewState.DOCKING, label: 'Docking & Analysis', icon: Activity },
    { id: ViewState.GENERATOR, label: 'Casino Generator', icon: Zap },
    { id: ViewState.JOBS, label: 'Job Monitor', icon: Cpu },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <div>
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary">
              <Dna className="h-5 w-5 text-white" />
              <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20"></div>
            </div>
            <span className="text-xl font-bold tracking-wider text-white">INVERO</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-surfaceHighlight p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">GPU CLUSTER</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-black">
              <div className="h-1.5 w-3/4 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">75% Utilization • 12/16 Nodes</p>
          </div>

          <div className="border-t border-white/10 pt-4">
             <button 
                onClick={onSettings}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
             >
                <Settings className="h-5 w-5" />
                Settings
             </button>
             <button 
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
             >
                <LogOut className="h-5 w-5" />
                Sign Out
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;