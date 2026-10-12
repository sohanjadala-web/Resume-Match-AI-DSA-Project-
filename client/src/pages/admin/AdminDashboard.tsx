import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Send,
  Building,
  TrendingUp,
  ShieldCheck,
  Award,
  Activity,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ analytics: any }>('/admin/analytics')
      .then((res) => setData(res.analytics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const overview = data?.overview;

  const stats = [
    { label: 'Registered Candidates', value: overview?.totalCandidates || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Registered Recruiters', value: overview?.totalRecruiters || 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Active Jobs', value: overview?.activeJobs || 0, icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Total Applications', value: overview?.totalApplications || 0, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  ];

  const conversionFunnel = [
    { stage: 'Applied', count: overview?.totalApplications || 0, fill: '#6366f1' },
    { stage: 'Shortlisted', count: overview?.shortlisted || 0, fill: '#10b981' },
    { stage: 'Interview', count: overview?.interviews || 0, fill: '#8b5cf6' },
    { stage: 'Selected', count: overview?.selected || 0, fill: '#3b82f6' },
  ];

  const domainData = data?.jobsByDomain?.map((j: any) => ({ name: j.domain, count: j.count })) || [];
  const popularSkills = data?.popularSkills || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Platform Governance & Telemetry</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Platform Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real database-derived operational metrics, hiring conversion rates, and algorithm activity.
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Recruitment Conversion Funnel
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Candidate progression through hiring stages ({overview?.conversionRate || 0}% final conversion)
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {conversionFunnel.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Domain */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Job Distribution by Domain
          </h2>
          <p className="text-xs text-slate-500 mb-4">Postings breakdown across technical disciplines</p>

          <div className="h-60 w-full flex items-center justify-center">
            {domainData.length === 0 ? (
              <span className="text-xs text-slate-400">No domain data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {domainData.map((_item: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Popular In-Demand Skills Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Most Frequently Indexed Competencies in Database
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {popularSkills.map((sk: any) => (
            <div key={sk.name} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white">{sk.name}</div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">{sk.category}</div>
              <div className="text-xs font-semibold text-slate-500 mt-2">{sk.count} profiles</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recently Registered Platform Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.recentUsers?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{u.fullName}</td>
                  <td className="py-3 px-3 text-slate-500">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
