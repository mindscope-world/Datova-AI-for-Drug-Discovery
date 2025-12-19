import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Download, Filter, FileText, Play, Loader2, Check } from 'lucide-react';
import { DOCKING_STATS, TOP_HITS } from '../constants';

const DockingAnalysis: React.FC = () => {
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'queued'>('idle');

  const handleInitializeExtraction = () => {
    setExtractionStatus('processing');
    // Simulate API call to trigger job
    setTimeout(() => {
      setExtractionStatus('queued');
      // Reset after a few seconds so user can theoretically run it again if needed, 
      // or keep it queued to show status. Keeping it queued for this demo.
      setTimeout(() => setExtractionStatus('idle'), 5000);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface p-6">
         <div>
             <h2 className="text-2xl font-bold text-white">DolceVita Analysis</h2>
             <p className="text-sm text-slate-400">Ranking distribution for job <span className="font-mono text-primary">JOB-8821</span></p>
         </div>
         <div className="flex gap-3">
             <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors">
                 <Filter className="h-4 w-4" /> Filter
             </button>
             <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                 <Download className="h-4 w-4" /> Export CSV
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-surface p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">Binding Energy Distribution (kcal/mol)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DOCKING_STATS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            tick={{fill: '#94a3b8', fontSize: 12}} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            tick={{fill: '#94a3b8', fontSize: 12}} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1A1C26', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {DOCKING_STATS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index > 5 ? '#334155' : index < 3 ? '#EC4899' : '#A855F7'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary"></div>
                    <span className="text-xs text-slate-400">Top Hits (-12.0 to -11.0)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="text-xs text-slate-400">Significant (-10.5 to -9.0)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-600"></div>
                    <span className="text-xs text-slate-400">Poor Binder</span>
                </div>
            </div>
        </div>

        {/* Top Hits Table */}
        <div className="rounded-2xl border border-white/5 bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Top Candidates</h3>
            <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surfaceHighlight text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3 text-right">Affinity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {TOP_HITS.map((hit) => (
                            <tr key={hit.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                <td className="px-4 py-3 font-mono text-slate-400">#{hit.rank}</td>
                                <td className="px-4 py-3 font-medium text-white group-hover:text-primary">{hit.moleculeId}</td>
                                <td className="px-4 py-3 text-right font-mono text-accent">{hit.affinity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className="mt-4 w-full rounded-lg border border-dashed border-white/20 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                View All 42 Candidates
            </button>
        </div>
      </div>

      {/* Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 p-8">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 className="text-xl font-bold text-white">Ready for Visual Inspection?</h3>
                <p className="text-slate-300 max-w-xl mt-2">
                    Generate structure files for the top 5% of hits. This will trigger the <span className="font-mono text-xs bg-black/30 px-1 py-0.5 rounded">MegaSdf2pdb</span> pipeline.
                </p>
            </div>
            <button 
                onClick={handleInitializeExtraction}
                disabled={extractionStatus !== 'idle'}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all shadow-lg ${
                    extractionStatus === 'idle' 
                    ? 'bg-white text-black hover:bg-slate-200 hover:scale-105 shadow-purple-500/20' 
                    : extractionStatus === 'processing'
                    ? 'bg-slate-200 text-slate-600 cursor-wait'
                    : 'bg-green-500 text-white shadow-green-500/20'
                }`}
            >
                {extractionStatus === 'idle' && (
                    <>
                        <Play className="h-4 w-4 fill-current" />
                        Initialize PDB Extraction
                    </>
                )}
                {extractionStatus === 'processing' && (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting Pipeline...
                    </>
                )}
                {extractionStatus === 'queued' && (
                    <>
                        <Check className="h-4 w-4" />
                        Extraction Job Queued
                    </>
                )}
            </button>
          </div>
          {/* Background decoration */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent"></div>
      </div>
    </div>
  );
};

export default DockingAnalysis;