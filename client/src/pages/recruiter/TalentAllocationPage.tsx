import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Users,
  Briefcase,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { ScoreBadge } from '../../components/common/ScoreBadge';

export const TalentAllocationPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ jobs: any[] }>('/recruiter/jobs'),
      api.get<{ candidates: any[] }>('/recruiter/candidates/search'),
    ])
      .then(([jRes, cRes]) => {
        const jList = jRes.jobs || [];
        const cList = cRes.candidates || [];
        setJobs(jList);
        setCandidates(cList);

        // Pre-select first 3 jobs and candidates for immediate demonstration convenience!
        setSelectedJobIds(jList.slice(0, 3).map((j) => j.id));
        setSelectedCandidateIds(cList.slice(0, 4).map((c) => c.id));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRunHungarian = async () => {
    if (selectedJobIds.length === 0 || selectedCandidateIds.length === 0) {
      alert('Please select at least 1 job role and 1 candidate.');
      return;
    }

    setOptimizing(true);
    setResult(null);

    try {
      const data = await api.post<any>('/recruiter/assignments/optimize', {
        jobIds: selectedJobIds,
        candidateIds: selectedCandidateIds,
      });

      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Failed to optimize assignments');
    } finally {
      setOptimizing(false);
    }
  };

  const toggleJob = (id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((jId) => jId !== id) : [...prev, id]
    );
  };

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Weighted Bipartite Matching (Kuhn-Munkres)</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Optimal Talent Allocation Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Solves Maximum Weight Bipartite Matching in O(V³) time complexity to assign candidates to roles with maximum global compatibility.
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <div className="font-bold">Algorithmic Advisory Notice</div>
          <p className="mt-0.5 opacity-90 leading-relaxed">
            Assignments remain advisory recommendations until reviewed and confirmed by the recruiter. The algorithm solves for maximum total collective compatibility across all selected openings.
          </p>
        </div>
      </div>

      {/* Role and Candidate Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Roles Selection */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Select Roles ({selectedJobIds.length}/{jobs.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedJobIds(jobs.map((j) => j.id))}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Select All
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {jobs.map((job) => {
              const isChecked = selectedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  onClick={() => toggleJob(job.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{job.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {job.domain} • Min {job.minExperienceYears} yrs
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Candidate Pool Selection */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Select Candidate Pool ({selectedCandidateIds.length}/{candidates.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCandidateIds(candidates.map((c) => c.id))}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Select All
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {candidates.map((c) => {
              const isChecked = selectedCandidateIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggleCandidate(c.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    isChecked
                      ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.user.fullName}</div>
                    <div className="text-[11px] text-slate-400">
                      {c.preferredDomain} • {c.yearsOfExperience} yrs exp
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunHungarian}
          disabled={optimizing || selectedJobIds.length === 0 || selectedCandidateIds.length === 0}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{optimizing ? 'Executing Kuhn-Munkres Algorithm...' : 'Run Hungarian Assignment Optimization'}</span>
        </button>
      </div>

      {/* OPTIMIZATION RESULTS */}
      {result && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Optimal Bipartite Assignment Solution
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Maximum weight bipartite matching computed across {selectedJobIds.length} roles and {selectedCandidateIds.length} candidates.
              </p>
            </div>

            {/* Runtime */}
            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Hungarian Runtime: <strong>{result.executionTimeMs} ms</strong>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-slate-500 block mb-1">Total Hungarian Score</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{result.totalScore}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cumulative global points</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block mb-1">Baseline Greedy Score</span>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{result.baselineGreedyScore}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sequential local choice</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-slate-500 block mb-1">Global Optimization Lift</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{result.scoreImprovement >= 0 ? result.scoreImprovement : 0} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Over greedy baseline</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
              <span className="text-slate-500 block mb-1">Average Match Score</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{result.averageScore}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Per allocated position</div>
            </div>
          </div>

          {/* Recommended Assignments Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Allocated Candidate-to-Role Pairs ({result.assignments?.length})
            </h4>

            <div className="space-y-3">
              {result.assignments?.map((edge: any) => (
                <div
                  key={edge.roleId}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {edge.roleTitle}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Matched Candidate: <strong className="text-indigo-600 dark:text-indigo-400">{edge.candidateName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Supporting Skills</div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {edge.supportingSkills?.length > 0 ? edge.supportingSkills.join(', ') : 'Direct Qualifications'}
                      </div>
                    </div>
                    <ScoreBadge score={edge.compatibilityScore} size="md" showLabel />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unfilled roles or unassigned candidates */}
          {(result.unfilledRoles?.length > 0 || result.unassignedCandidates?.length > 0) && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {result.unfilledRoles?.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                  <span className="font-bold block mb-1">Unfilled Positions:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.unfilledRoles.map((r: any) => (
                      <li key={r.id}>{r.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.unassignedCandidates?.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span className="font-bold block mb-1">Available Reserve Candidates:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.unassignedCandidates.map((c: any) => (
                      <li key={c.id}>{c.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
