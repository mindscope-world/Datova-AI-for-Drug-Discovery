import React from 'react';
import { MOCK_JOBS } from '../constants';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

const JobMonitor: React.FC = () => {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Job Monitor</h2>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <RefreshCw className="h-5 w-5" />
            </button>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-surfaceHighlight border-b border-white/5">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Job ID</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Task Name</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Progress</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Started</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {MOCK_JOBS.map((job) => (
                        <tr key={job.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm text-slate-400">{job.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-white">{job.name}</td>
                            <td className="px-6 py-4">
                                <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300 border border-white/10">
                                    {job.type}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {job.status === 'COMPLETED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    {job.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                                    {job.status === 'RUNNING' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                                    <span className={`text-sm font-medium ${
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
                                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surfaceHighlight">
                                        <div 
                                            className={`h-full rounded-full ${
                                                job.status === 'FAILED' ? 'bg-red-500' : 'bg-primary'
                                            }`} 
                                            style={{ width: `${job.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500">{job.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {job.startedAt}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default JobMonitor;