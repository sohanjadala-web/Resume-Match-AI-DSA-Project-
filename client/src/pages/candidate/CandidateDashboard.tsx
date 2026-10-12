import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  UserCheck,
  Calendar,
  CheckCircle,
  BookmarkCheck,
  TrendingUp,
  FileText,
  Compass,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { api } from '../../services/api';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { SkillTag } from '../../components/common/SkillTag';

export const CandidateDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ analytics: any }>('/candidate/analytics'),
      api.get<{ profile: any }>('/candidate/profile'),
      api.get<{ recommendations: any[] }>('/candidate/recommendations?minScore=0'),
      api.get<{ applications: any[] }>('/candidate/applications'),
    ])
      .then(([aRes, pRes, rRes, appRes]) => {
        setAnalytics(aRes.analytics);
        setProfile(pRes.profile);
        setRecommendations((rRes.recommendations || []).slice(0, 3));
        setRecentApplications((appRes.applications || []).slice(0, 3));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statsCards = [
    { label: 'Total Applications', value: analytics?.totalApplications || 0, icon: Send, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Shortlisted', value: analytics?.shortlisted || 0, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Interviews Scheduled', value: analytics?.interviews || 0, icon: Calendar, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Offers / Selected', value: analytics?.selected || 0, icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  ];

  const appStatusData = [
    { name: 'Under Review', count: analytics?.underReview || 0, color: '#f59e0b' },
    { name: 'Shortlisted', count: analytics?.shortlisted || 0, color: '#10b981' },
    { name: 'Interviews', count: analytics?.interviews || 0, color: '#8b5cf6' },
    { name: 'Selected', count: analytics?.selected || 0, color: '#3b82f6' },
    { name: 'Rejected', count: analytics?.rejected || 0, color: '#ef4444' },
  ].filter((d) => d.count > 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-200 text-xs font-semibold mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Matching Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.user?.fullName || 'Candidate'}!
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            Your candidate profile is actively indexed in the talent engine. Check out your highest compatibility matches or upload a newer résumé.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/candidate/recommendations"
              className="px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" /> View Top Job Matches
            </Link>
            <Link
              to="/candidate/resume"
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs transition backdrop-blur-sm flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Parse & Update Résumé
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Meter & Suggestions */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Profile Readiness Score
            </span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {profile?.profileCompletedPercent || 25}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${profile?.profileCompletedPercent || 25}%` }}
            />
          </div>
          {analytics?.suggestedSkills && analytics.suggestedSkills.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Suggested market skills:</span>
              <div className="flex flex-wrap gap-1">
                {analytics.suggestedSkills.slice(0, 4).map((s: string) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[11px] font-medium">
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Link
          to="/candidate/profile"
          className="shrink-0 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Edit Profile Details
        </Link>
      </div>

      {/* 4 Stats Cards */}
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

      {/* Main Grid: Top Matches & Application Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Highest Compatibility Opportunities</span>
            </h2>
            <Link
              to="/candidate/recommendations"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No active recommendations found. Complete your skills profile to generate compatibility scores!
              </div>
            ) : (
              recommendations.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {job.title}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {job.company?.name} • {job.location} ({job.workMode})
                      </div>
                    </div>
                    <ScoreBadge score={job.compatibilityScore || 0} size="md" />
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.requiredSkills?.map((s: any) => (
                      <SkillTag
                        key={s.skillId}
                        name={s.skill.name}
                        isMatched={job.matchingRequiredSkills?.includes(s.skill.name)}
                        isMissing={job.missingRequiredSkills?.includes(s.skill.name)}
                        size="sm"
                      />
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Min Exp: <strong className="text-slate-700 dark:text-slate-300">{job.minExperienceYears} yrs</strong>
                    </span>
                    <Link
                      to="/candidate/recommendations"
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      View Match Breakdown & Apply <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Application Pipeline Chart (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Application Pipeline Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">Real-time status breakdown</p>

            {appStatusData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active applications yet. Apply to jobs to populate pipeline stats!
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {appStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/candidate/applications"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Full Applications Timeline →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
