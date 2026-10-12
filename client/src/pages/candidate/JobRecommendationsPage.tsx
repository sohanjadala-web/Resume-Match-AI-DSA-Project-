import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Send,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { SkillTag } from '../../components/common/SkillTag';
import { MatchBreakdownModal } from '../../components/common/MatchBreakdownModal';

export const JobRecommendationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [minScore, setMinScore] = useState('0');
  const [sortBy, setSortBy] = useState('score');
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  // Modal breakdown state
  const [modalJob, setModalJob] = useState<Job | null>(null);

  // Applying state
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applySuccessId, setApplySuccessId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDomain !== 'All') params.append('domain', selectedDomain);
      if (selectedMode !== 'All') params.append('workMode', selectedMode);
      if (minScore !== '0') params.append('minScore', minScore);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('sort', sortBy);

      const data = await api.get<{ recommendations: Job[]; executionTimeMs: number }>(
        `/candidate/recommendations?${params.toString()}`
      );
      setJobs(data.recommendations || []);
      setExecutionTimeMs(data.executionTimeMs || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedDomain, selectedMode, minScore, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    try {
      await api.post(`/candidate/jobs/${jobId}/apply`);
      setApplySuccessId(jobId);
      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, hasApplied: true, applicationStatus: 'APPLIED' } : j))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleToggleSave = async (job: Job) => {
    try {
      if (job.isSaved) {
        await api.delete(`/candidate/jobs/${job.id}/save`);
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isSaved: false } : j)));
      } else {
        await api.post(`/candidate/jobs/${job.id}/save`);
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isSaved: true } : j)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const domains = [
    'All',
    'Software Engineering',
    'AI/ML',
    'Data Science',
    'Cybersecurity',
    'UI/UX',
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Intelligent Job Recommendations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalized algorithmic matching computed via multi-factor compatibility scoring.
          </p>
        </div>
        {executionTimeMs > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Compatibility Score Latency: <strong>{executionTimeMs} ms</strong></span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, required skill, or company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
            >
              {domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Work Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Match Score</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
            >
              <option value="0">Any Match (&gt;= 0%)</option>
              <option value="50">Moderate Match (&gt;= 50%)</option>
              <option value="70">Strong Match (&gt;= 70%)</option>
              <option value="85">Excellent Match (&gt;= 85%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
            >
              <option value="score">Highest Compatibility</option>
              <option value="date">Most Recent</option>
              <option value="salary">Highest Compensation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Feed */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Calculating compatibility matrices...
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No job postings match your active filter criteria. Try adjusting the minimum score or domain filter.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {job.domain}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{job.company?.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location} ({job.workMode})</span>
                    {job.salaryMin && (
                      <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <DollarSign className="w-3 h-3" /> ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax ? job.salaryMax / 1000 : 0).toFixed(0)}k
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    onClick={() => handleToggleSave(job)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    title={job.isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    {job.isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                  <ScoreBadge score={job.compatibilityScore || 0} size="lg" showLabel />
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {job.description}
              </p>

              {/* Skills Chips */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">Required Skills & Coverage:</div>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills?.map((s) => (
                    <SkillTag
                      key={s.skillId}
                      name={s.skill.name}
                      isMatched={job.matchingRequiredSkills?.includes(s.skill.name)}
                      isMissing={job.missingRequiredSkills?.includes(s.skill.name)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => setModalJob(job)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <HelpCircle className="w-4 h-4" /> Why does this job match you? (Score Breakdown)
                </button>

                <div className="flex items-center gap-2">
                  {job.hasApplied ? (
                    <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Applied ({job.applicationStatus || 'Applied'})
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applyingJobId === job.id}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{applyingJobId === job.id ? 'Submitting...' : 'Apply Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Breakdown Modal */}
      {modalJob && (
        <MatchBreakdownModal
          isOpen={!!modalJob}
          onClose={() => setModalJob(null)}
          jobTitle={modalJob.title}
          companyName={modalJob.company?.name || ''}
          score={modalJob.compatibilityScore || 0}
          breakdown={modalJob.scoreBreakdown}
          matchingRequired={modalJob.matchingRequiredSkills || []}
          missingRequired={modalJob.missingRequiredSkills || []}
          matchingPreferred={modalJob.matchingPreferredSkills || []}
          explanation={modalJob.explanation}
        />
      )}
    </div>
  );
};
