import React, { useState, useEffect } from 'react';
import {
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Video,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Building,
} from 'lucide-react';
import { api } from '../../services/api';
import { Application } from '../../types';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { MatchBreakdownModal } from '../../components/common/MatchBreakdownModal';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeBreakdownJob, setActiveBreakdownJob] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.get<{ applications: Application[] }>('/candidate/applications');
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    APPLIED: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    SHORTLISTED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    INTERVIEW_SCHEDULED: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    SELECTED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  };

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Application Pipeline & Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track hiring progression, interview invitations, and status audit histories.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading your applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No applications match the selected status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            let breakdownData: any = null;
            try {
              if (app.scoreBreakdownJson) breakdownData = JSON.parse(app.scoreBreakdownJson);
            } catch {}

            return (
              <div
                key={app.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {app.job?.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-100'}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {app.job?.company?.name}
                      </span>
                      <span>•</span>
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ScoreBadge score={app.compatibilityScore} size="md" showLabel />
                    <button
                      onClick={() =>
                        setActiveBreakdownJob({
                          jobTitle: app.job?.title,
                          companyName: app.job?.company?.name,
                          score: app.compatibilityScore,
                          breakdown: breakdownData,
                          matchingRequired: [],
                          missingRequired: [],
                          matchingPreferred: [],
                        })
                      }
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Breakdown
                    </button>
                  </div>
                </div>

                {/* Scheduled Interviews Alert */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-purple-900 dark:text-purple-300">
                      <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Interview Round Scheduled</span>
                    </div>
                    {app.interviews.map((iv) => (
                      <div key={iv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{iv.title}</div>
                          <div className="text-slate-500 mt-0.5">
                            Date: {new Date(iv.scheduledAt).toLocaleString()} ({iv.durationMins} mins)
                          </div>
                        </div>
                        {iv.meetingLink && (
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition flex items-center gap-1 self-start sm:self-auto text-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Join Video Meeting
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Timeline History */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Hiring Activity Timeline
                  </div>
                  <div className="space-y-2">
                    {app.statusHistory?.map((h) => (
                      <div key={h.id} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {h.toStatus.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-2">
                            {new Date(h.timestamp).toLocaleString()} ({h.changedByRole})
                          </span>
                          {h.comment && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{h.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Breakdown Modal */}
      {activeBreakdownJob && (
        <MatchBreakdownModal
          isOpen={!!activeBreakdownJob}
          onClose={() => setActiveBreakdownJob(null)}
          jobTitle={activeBreakdownJob.jobTitle}
          companyName={activeBreakdownJob.companyName}
          score={activeBreakdownJob.score}
          breakdown={activeBreakdownJob.breakdown}
          matchingRequired={[]}
          missingRequired={[]}
          matchingPreferred={[]}
        />
      )}
    </div>
  );
};
