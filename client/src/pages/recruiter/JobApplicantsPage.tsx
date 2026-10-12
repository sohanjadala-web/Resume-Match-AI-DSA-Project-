import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  UserCheck,
  Check,
  X,
  Calendar,
  MessageSquare,
  Award,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Video,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { SkillTag } from '../../components/common/SkillTag';
import { MatchBreakdownModal } from '../../components/common/MatchBreakdownModal';
import { CandidateCompareModal } from '../../components/common/CandidateCompareModal';

export const JobApplicantsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const [job, setJob] = useState<any>(null);
  const [rankedCandidates, setRankedCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  // Modals state
  const [breakdownModalCandidate, setBreakdownModalCandidate] = useState<any | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Interview Schedule modal
  const [scheduleModalApp, setScheduleModalApp] = useState<any | null>(null);
  const [interviewTitle, setInterviewTitle] = useState('Technical Architecture Round');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewMeetingLink, setInterviewMeetingLink] = useState('https://meet.google.com/resumematch-demo');
  const [scheduling, setScheduling] = useState(false);

  // Note modal
  const [noteModalApp, setNoteModalApp] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchRankedCandidates();
    }
  }, [jobId]);

  const fetchRankedCandidates = async () => {
    try {
      const data = await api.get<{ job: any; rankedCandidates: any[]; executionTimeMs: number }>(
        `/recruiter/jobs/${jobId}/candidates`
      );
      setJob(data.job);
      setRankedCandidates(data.rankedCandidates || []);
      setExecutionTimeMs(data.executionTimeMs || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string, comment?: string) => {
    try {
      await api.patch(`/recruiter/applications/${appId}/status`, { status, comment });
      fetchRankedCandidates();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;
    setScheduling(true);

    try {
      await api.post(`/recruiter/applications/${scheduleModalApp.id}/interview`, {
        title: interviewTitle,
        scheduledAt: interviewDate,
        meetingLink: interviewMeetingLink,
      });

      setScheduleModalApp(null);
      fetchRankedCandidates();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalApp || !noteText.trim()) return;

    try {
      await api.post(`/recruiter/applications/${noteModalApp.id}/notes`, {
        noteText: noteText.trim(),
      });

      setNoteModalApp(null);
      setNoteText('');
      fetchRankedCandidates();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const toggleSelectCandidate = (candidateId: string) => {
    if (selectedForComparison.includes(candidateId)) {
      setSelectedForComparison(selectedForComparison.filter((id) => id !== candidateId));
    } else {
      if (selectedForComparison.length >= 5) {
        alert('You can compare a maximum of 5 candidates side-by-side.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, candidateId]);
    }
  };

  const compareCandidatesList = rankedCandidates
    .filter((rc) => selectedForComparison.includes(rc.candidate.id))
    .map((rc) => ({
      id: rc.candidate.id,
      name: rc.candidate.user.fullName,
      headline: rc.candidate.headline,
      experienceYears: rc.candidate.yearsOfExperience,
      compatibilityScore: rc.compatibilityScore,
      matchingRequiredSkills: rc.matchingRequiredSkills,
      missingRequiredSkills: rc.missingRequiredSkills,
      education: rc.candidate.education?.[0]?.degree,
      projectsCount: rc.candidate.projects?.length || 0,
      status: rc.status,
    }));

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Jobs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Candidate Ranking: {job?.title}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              {rankedCandidates.length} Evaluated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic tie-broken candidate ranking generated by Multi-Factor Compatibility Scorer.
          </p>
        </div>

        {/* Comparison Trigger Button */}
        <div className="flex items-center gap-2">
          {selectedForComparison.length >= 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-2 animate-in zoom-in-95"
            >
              <Layers className="w-4 h-4" />
              <span>Compare Selected ({selectedForComparison.length})</span>
            </button>
          )}

          <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Latency: <strong>{executionTimeMs} ms</strong>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Executing compatibility scoring...</div>
      ) : rankedCandidates.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No candidates registered in database.
        </div>
      ) : (
        <div className="space-y-4">
          {rankedCandidates.map((rc, rankIdx) => {
            const c = rc.candidate;
            const app = rc.application;
            const isSelected = selectedForComparison.includes(c.id);

            return (
              <div
                key={c.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm space-y-4 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox for compare */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectCandidate(c.id)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      title="Select for comparison"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                          #{rankIdx + 1}
                        </span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {c.user.fullName}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {rc.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.headline || 'Software Professional'} • {c.yearsOfExperience} yrs experience • {c.location || 'Remote'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        setBreakdownModalCandidate({
                          candidateName: c.user.fullName,
                          jobTitle: job.title,
                          companyName: job.company?.name,
                          score: rc.compatibilityScore,
                          breakdown: rc.scoreBreakdown,
                          matchingRequired: rc.matchingRequiredSkills,
                          missingRequired: rc.missingRequiredSkills,
                          matchingPreferred: rc.matchingPreferredSkills,
                          explanation: rc.explanation,
                        })
                      }
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Breakdown
                    </button>
                    <ScoreBadge score={rc.compatibilityScore} size="lg" showLabel />
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 text-xs text-slate-600 dark:text-slate-400">
                  {rc.explanation}
                </div>

                {/* Skills tags */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">Skills Evaluation:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {rc.matchingRequiredSkills.map((s: string) => (
                      <SkillTag key={s} name={s} isMatched size="sm" />
                    ))}
                    {rc.missingRequiredSkills.map((s: string) => (
                      <SkillTag key={s} name={s} isMissing size="sm" />
                    ))}
                  </div>
                </div>

                {/* Recruiter Action Buttons */}
                {app && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Cover note: </span>
                      <span className="italic text-slate-600 dark:text-slate-300">
                        &ldquo;{app.coverLetter || 'Direct application'}&rdquo;
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED', 'Shortlisted by recruiter')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => {
                          setScheduleModalApp(app);
                          setInterviewDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold hover:bg-purple-100 transition flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'SELECTED', 'Candidate offered & selected')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold hover:bg-blue-100 transition"
                      >
                        Select & Hire
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED', 'Application archived')}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold hover:bg-rose-100 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Match Breakdown Modal */}
      {breakdownModalCandidate && (
        <MatchBreakdownModal
          isOpen={!!breakdownModalCandidate}
          onClose={() => setBreakdownModalCandidate(null)}
          jobTitle={breakdownModalCandidate.jobTitle}
          companyName={breakdownModalCandidate.companyName}
          score={breakdownModalCandidate.score}
          breakdown={breakdownModalCandidate.breakdown}
          matchingRequired={breakdownModalCandidate.matchingRequired}
          missingRequired={breakdownModalCandidate.missingRequired}
          matchingPreferred={breakdownModalCandidate.matchingPreferred}
          explanation={breakdownModalCandidate.explanation}
        />
      )}

      {/* Multi-Candidate Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <CandidateCompareModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          jobTitle={job?.title || 'Open Role'}
          candidates={compareCandidatesList}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Schedule Candidate Interview</h3>
            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Title</label>
                <input
                  type="text"
                  required
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Video Meeting Link</label>
                <input
                  type="url"
                  required
                  value={interviewMeetingLink}
                  onChange={(e) => setInterviewMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
