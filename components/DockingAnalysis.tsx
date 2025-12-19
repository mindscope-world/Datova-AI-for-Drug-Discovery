import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Download, Filter, FileText, Play, Loader2, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { DOCKING_STATS, TOP_HITS } from '../constants';
import { ViewState } from '../types';

interface DockingAnalysisProps {
    setView: (view: ViewState) => void;
}

const DockingAnalysis: React.FC<DockingAnalysisProps> = ({ setView }) => {
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'queued'>('idle');
  const [filterMode, setFilterMode] = useState<'all' | 'top'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredHits = useMemo(() => {
    if (filterMode === 'top') return TOP_HITS.filter(h => h.affinity < -11.8);
    return TOP_HITS;
  }, [filterMode]);

  const handleInitializeExtraction = () => {
    setExtractionStatus('processing');
    setTimeout(() => {
      setExtractionStatus('queued');
      setTimeout(() => setExtractionStatus('idle'), 5000);
    }, 2000);
  };

  const exportCSV = () => {
    const headers = "Rank,ID,Affinity,RMSD_LB,RMSD_UB\n";
    const rows = TOP_HITS.map(h => `${h.rank},${h.moleculeId},${h.affinity},${h.rmsdLb},${h.rmsdUb}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docking_hits_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface p-6 shadow-xl">
         <div>
             <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">DolceVita Analysis</h2>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Ranking distribution for pipeline <span className="text-primary">#JOB-8821</span></p>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={() => setFilterMode(f => f === 'all' ? 'top' : 'all')}
                className={`flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${filterMode === 'top' ? 'bg-primary text-white border-primary' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
             >
                 <Filter className="h-4 w-4" /> {filterMode === 'all' ? 'Show Top Only' : 'Showing Top'}
             </button>
             <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95">
                 <Download className="h-4 w-4" /> Export CSV
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-white/5 bg-surface p-6 shadow-2xl">
            <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Binding Energy Spectrum (ΔG)</h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DOCKING_STATS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#050508', borderColor: '#334155', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} cursor={{fill: 'rgba(168,85,247,0.05)'}} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {DOCKING_STATS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index < 2 ? '#EC4899' : index < 5 ? '#A855F7' : '#1A1C26'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-8">
                {[
                    { color: 'bg-secondary', label: 'Lead Class (-12.0 to -11.5)' },
                    { color: 'bg-primary', label: 'Hit Class (-11.0 to -10.0)' },
                    { color: 'bg-slate-800', label: 'Off-Target / Weak' }
                ].map((l, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${l.color} shadow-[0_0_8px_currentColor]`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{l.label}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-white/5 bg-surface p-6 flex flex-col shadow-2xl">
            <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Top Candidates</h3>
            <div className="flex-1 overflow-hidden rounded-2xl border border-white/5 bg-black/20">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                        <tr>
                            <th className="px-5 py-4">Rank</th>
                            <th className="px-5 py-4">Molecule ID</th>
                            <th className="px-5 py-4 text-right">Affinity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredHits.slice(0, isExpanded ? 20 : 5).map((hit) => (
                            <tr 
                                key={hit.id} 
                                onClick={() => setView(ViewState.MOLECULES)}
                                className="hover:bg-primary/5 transition-all group cursor-pointer"
                            >
                                <td className="px-5 py-4 font-mono text-[11px] text-slate-500 group-hover:text-primary transition-colors">#{hit.rank}</td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-200 group-hover:text-white">{hit.moleculeId}</span>
                                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right font-mono text-xs font-bold text-accent group-hover:text-primary transition-colors">{hit.affinity.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl border border-white/5 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
                {isExpanded ? <><ChevronUp className="h-3 w-3" /> Show Less</> : <><ChevronDown className="h-3 w-3" /> View All {TOP_HITS.length} Hits</>}
            </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-background border border-white/10 p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center lg:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                    Ready for Structural Review
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Geometric Extraction</h3>
                <p className="text-slate-400 mt-3 text-sm leading-relaxed font-medium">
                    Convert raw docking trajectories into inspectable PDB structures for the top percentile.
                    This process triggers the <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-primary">MEGA-SDF-CONVERT</span> cluster job.
                </p>
            </div>
            <button 
                onClick={handleInitializeExtraction}
                disabled={extractionStatus !== 'idle'}
                className={`group relative flex items-center gap-3 rounded-2xl px-8 py-5 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${
                    extractionStatus === 'idle' 
                    ? 'bg-white text-black hover:bg-slate-200 hover:scale-105 active:scale-95' 
                    : extractionStatus === 'processing'
                    ? 'bg-slate-300 text-slate-600 cursor-wait'
                    : 'bg-green-500 text-white'
                }`}
            >
                {extractionStatus === 'idle' && (
                    <>
                        <Play className="h-5 w-5 fill-current" />
                        Execute Extraction
                    </>
                )}
                {extractionStatus === 'processing' && (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Allocating Nodes...
                    </>
                )}
                {extractionStatus === 'queued' && (
                    <>
                        <Check className="h-5 w-5" />
                        Job #992 Active
                    </>
                )}
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default DockingAnalysis;