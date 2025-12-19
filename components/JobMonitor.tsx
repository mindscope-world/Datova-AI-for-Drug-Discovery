import React, { useState, useMemo } from 'react';
import { MOCK_JOBS } from '../constants';
import { Job } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  RefreshCw, 
  Filter, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X,
  SlidersHorizontal
} from 'lucide-react';

type SortField = 'id' | 'name' | 'progress' | 'startedAt' | 'status';
type SortDirection = 'asc' | 'desc';

const JobMonitor: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...MOCK_JOBS];

    // Search
    if (searchQuery) {
      result = result.filter(job => 
        job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(job => job.status === statusFilter);
    }

    // Type Filter
    if (typeFilter !== 'ALL') {
      result = result.filter(job => job.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'progress') {
        comparison = a.progress - b.progress;
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  const jobTypes = Array.from(new Set(MOCK_JOBS.map(j => j.type)));

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Cluster Job Monitor</h2>
                <p className="text-sm text-slate-500">Real-time tracking of computational pipelines across 16 active nodes.</p>
            </div>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={handleRefresh}
                    className={`flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Node State
                </button>
            </div>
        </div>

        {/* Filters Bar */}
        <div className="rounded-2xl border border-white/5 bg-surface p-4 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search by Job ID or name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-2 border-r border-white/10">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                </div>
                <div className="flex bg-background p-1 rounded-lg border border-white/10">
                    {['ALL', 'RUNNING', 'COMPLETED', 'FAILED', 'QUEUED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-tight transition-all ${
                                statusFilter === status 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 px-2 border-l border-r border-white/10">
                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</span>
                </div>
                <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-background border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-primary"
                >
                    <option value="ALL">All Pipeline Types</option>
                    {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>

        {/* Jobs Table */}
        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden shadow-2xl">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surfaceHighlight border-b border-white/5">
                        <tr>
                            <th 
                                className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => toggleSort('id')}
                            >
                                <div className="flex items-center gap-2">
                                    Job ID
                                    <SortIndicator field="id" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => toggleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Task Name
                                    <SortIndicator field="name" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Type</th>
                            <th 
                                className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => toggleSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    Status
                                    <SortIndicator field="status" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => toggleSort('progress')}
                            >
                                <div className="flex items-center gap-2">
                                    Progress
                                    <SortIndicator field="progress" />
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => toggleSort('startedAt')}
                            >
                                <div className="flex items-center gap-2">
                                    Started
                                    <SortIndicator field="startedAt" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredAndSortedJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-primary transition-colors">
                                    {job.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">{job.name}</span>
                                        <span className="text-[10px] text-slate-600">Instance ID: {Math.random().toString(16).slice(2, 10)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-white/5 uppercase tracking-wider">
                                        {job.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {job.status === 'COMPLETED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        {job.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                                        {job.status === 'RUNNING' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                                        {job.status === 'QUEUED' && <Clock className="h-4 w-4 text-slate-500" />}
                                        <span className={`text-[11px] font-bold uppercase tracking-tight ${
                                            job.status === 'COMPLETED' ? 'text-green-500' :
                                            job.status === 'FAILED' ? 'text-red-500' :
                                            job.status === 'RUNNING' ? 'text-blue-500' : 'text-slate-500'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-background border border-white/5">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${
                                                    job.status === 'FAILED' ? 'bg-red-500' : 
                                                    job.status === 'COMPLETED' ? 'bg-green-500' :
                                                    'bg-gradient-to-r from-primary to-accent animate-pulse-slow'
                                                }`} 
                                                style={{ width: `${job.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500">{job.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 opacity-50" />
                                        {job.startedAt}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
             
             {filteredAndSortedJobs.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                    <Filter className="h-12 w-12 opacity-10 mb-4" />
                    <p className="text-sm font-medium">No matching cluster jobs found</p>
                    <button 
                        onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); setSearchQuery(''); }}
                        className="mt-2 text-xs text-primary hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
             )}
        </div>
        
        {/* Footer Stats */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
            <div className="flex gap-4">
                <span>Total Jobs: {MOCK_JOBS.length}</span>
                <span>Filtered: {filteredAndSortedJobs.length}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>System Health: Nominal</span>
            </div>
        </div>
    </div>
  );
};

export default JobMonitor;