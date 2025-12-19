import React from 'react';
import { ArrowUpRight, Database, FlaskConical, Microscope, Clock } from 'lucide-react';
import { MOCK_PROJECTS, MOCK_JOBS } from '../constants';
import { ViewState } from '../types';

interface DashboardProps {
    setView: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surfaceHighlight to-surface border border-white/5 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                Invero Platform v2.0 Live
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
                Unlock the Secrets <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                    of Your Molecules
                </span>
            </h1>
            <p className="mb-8 text-lg text-slate-400">
                AI-driven analysis analyzing brain activity to provide insight into your mental and physical well-being.
                (Adapted for Drug Discovery: Transform RDKit scripts into automated pipelines).
            </p>
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => setView(ViewState.PROJECTS)}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-3 font-semibold text-black transition-all hover:bg-slate-200"
                >
                    <span className="mr-2">Explore Projects</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
                <button
                    onClick={() => setView(ViewState.DOCKING)}
                     className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                    Run Analysis
                </button>
            </div>
        </div>

        {/* Abstract visual decoration */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/10 blur-[80px]"></div>
        
        {/* Floating Molecule Mockup */}
         <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative h-64 w-64">
                <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-white/10"></div>
                <div className="absolute inset-4 animate-reverse-spin rounded-full border border-dashed border-white/10"></div>
                 {/* Center generic molecule abstract representation */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <FlaskConical className="h-16 w-16 text-primary/80 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                 </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Projects', value: '12', icon: Database, color: 'text-blue-400' },
          { label: 'Molecules Screened', value: '1.2M', icon: Microscope, color: 'text-green-400' },
          { label: 'Compute Hours', value: '8.5k', icon: Clock, color: 'text-orange-400' },
          { label: 'Success Rate', value: '4.2%', icon: FlaskConical, color: 'text-purple-400' },
        ].map((stat, idx) => (
          <div key={idx} className="group rounded-2xl border border-white/5 bg-surface p-6 transition-all hover:border-white/10 hover:bg-surfaceHighlight">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity / Jobs */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                <button onClick={() => setView(ViewState.PROJECTS)} className="text-sm text-primary hover:text-primary/80">View All</button>
            </div>
            <div className="space-y-4">
                {MOCK_PROJECTS.slice(0, 3).map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between rounded-xl bg-surfaceHighlight p-4 transition-colors hover:bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <Database className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{proj.name}</h4>
                                <p className="text-xs text-slate-500">{proj.moleculeCount} molecules • {proj.lastActive}</p>
                            </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
                            proj.status === 'active' ? 'bg-green-500/10 text-green-400' :
                            proj.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                            {proj.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Active Jobs</h3>
                <button onClick={() => setView(ViewState.JOBS)} className="text-sm text-primary hover:text-primary/80">Monitor</button>
            </div>
            <div className="space-y-4">
                {MOCK_JOBS.slice(0, 3).map((job) => (
                    <div key={job.id} className="rounded-xl bg-surfaceHighlight p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${
                                    job.status === 'RUNNING' ? 'bg-blue-400 animate-pulse' :
                                    job.status === 'COMPLETED' ? 'bg-green-400' :
                                    job.status === 'FAILED' ? 'bg-red-400' : 'bg-slate-400'
                                }`}></div>
                                <span className="text-sm font-medium text-slate-200">{job.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{job.startedAt}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        job.status === 'FAILED' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                    }`}
                                    style={{ width: `${job.progress}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-mono text-slate-400">{job.progress}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;