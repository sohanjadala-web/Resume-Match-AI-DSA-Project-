import React, { useState, useEffect } from 'react';
import { Briefcase, Building, AlertCircle, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const data = await api.get<{ jobs: Job[] }>(`/admin/jobs?${params.toString()}`);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    try {
      await api.patch(`/admin/jobs/${jobId}/status`, { status });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: status as any } : j)));
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Job Postings & Content Audit</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review company postings, audit compliance, and enforce job closing or suspension policies.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Search by job title or company name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-semibold text-slate-500 text-[11px]">Status:</span>
          {['', 'ACTIVE', 'PAUSED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st || 'All Jobs'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Auditing job records...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No job records match the search filter.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Title & Company</th>
                  <th className="py-3.5 px-5">Domain & Location</th>
                  <th className="py-3.5 px-5">Openings</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Applicants</th>
                  <th className="py-3.5 px-5 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</div>
                      <div className="text-slate-400 text-[11px]">{job.company?.name}</div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                      <div>{job.domain}</div>
                      <div className="text-[11px] text-slate-400">{job.location} ({job.workMode})</div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">{job.openings}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-indigo-600 dark:text-indigo-400">
                      {(job as any)._count?.applications || 0}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      {job.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'CLOSED')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 font-semibold hover:bg-rose-100 transition"
                        >
                          Close Posting
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'ACTIVE')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition"
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
