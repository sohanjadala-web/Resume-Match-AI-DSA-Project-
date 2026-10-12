import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Target,
  Share2,
  Plus,
  ArrowRight,
  Sparkles,
  Building,
  UserCheck,
  Calendar,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';

export const RecruiterDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ profile: any }>('/recruiter/profile'),
      api.get<{ jobs: any[] }>('/recruiter/jobs'),
    ])
      .then(([pRes, jRes]) => {
        setProfile(pRes.profile);
        setJobs(jRes.jobs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.stats?.applicants || 0), 0);
  const totalShortlisted = jobs.reduce((acc, j) => acc + (j.stats?.shortlisted || 0), 0);
  const totalInterviews = jobs.reduce((acc, j) => acc + (j.stats?.interview || 0), 0);
  const totalSelected = jobs.reduce((acc, j) => acc + (j.stats?.selected || 0), 0);

  const statsCards = [
    { label: 'Active Jobs', value: jobs.filter((j) => j.status === 'ACTIVE').length, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Shortlisted Candidates', value: totalShortlisted, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Active Interviews', value: totalInterviews, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Recruiter & Company Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-3">
            <Building className="w-3.5 h-3.5" />
            <span>{profile?.company?.name || 'Recruiter Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.user?.fullName || 'Recruiter'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Hiring platform powered by real DSA optimization. Discover candidate talent, execute Hungarian role allocations, or generate agile project teams.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/recruiter/jobs"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create New Job Posting
            </Link>
            <Link
              to="/recruiter/talent-allocation"
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Target className="w-4 h-4" /> Hungarian Talent Allocation
            </Link>
            <Link
              to="/recruiter/team-builder"
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> Build Project Team
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Active Jobs Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Job Postings & Pipeline</h2>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No jobs published yet. Click &ldquo;Create New Job Posting&rdquo; to launch your first role.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((j) => (
              <div
                key={j.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{j.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {j.domain} • {j.location} ({j.workMode})
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {j.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs border-y border-slate-100 dark:border-slate-800 py-2.5">
                  <div>
                    <div className="font-black text-slate-900 dark:text-white text-sm">{j.stats?.applicants || 0}</div>
                    <div className="text-[10px] text-slate-400">Applicants</div>
                  </div>
                  <div>
                    <div className="font-black text-emerald-600 text-sm">{j.stats?.shortlisted || 0}</div>
                    <div className="text-[10px] text-slate-400">Shortlisted</div>
                  </div>
                  <div>
                    <div className="font-black text-purple-600 text-sm">{j.stats?.interview || 0}</div>
                    <div className="text-[10px] text-slate-400">Interview</div>
                  </div>
                  <div>
                    <div className="font-black text-blue-600 text-sm">{j.stats?.selected || 0}</div>
                    <div className="text-[10px] text-slate-400">Selected</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">
                    Avg Match: <strong className="text-indigo-600">{j.stats?.avgScore || 0}%</strong>
                  </span>
                  <Link
                    to={`/recruiter/jobs/${j.id}/applicants`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 transition flex items-center gap-1"
                  >
                    <span>View Ranked Candidates</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
