import React, { useState } from 'react';
import {
  Share2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  Cpu,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { SkillTag } from '../../components/common/SkillTag';

export const TeamBuilderPage: React.FC = () => {
  const [projectName, setProjectName] = useState('Cloud-Native Microservices Migration');
  const [description, setDescription] = useState('High-throughput real-time backend migration to Kubernetes with React frontend console.');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('React, TypeScript, Go, Kubernetes, Docker, AWS, PostgreSQL');
  const [targetTeamSize, setTargetTeamSize] = useState('4');
  const [domain, setDomain] = useState('Software Engineering');

  const [forming, setForming] = useState(false);
  const [teamResult, setTeamResult] = useState<any | null>(null);

  const handleFormTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setForming(true);
    setTeamResult(null);

    try {
      const skillsList = requiredSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const data = await api.post<any>('/recruiter/teams/recommend', {
        projectName,
        description,
        requiredSkills: skillsList,
        targetTeamSize: parseInt(targetTeamSize),
        domain,
      });

      setTeamResult(data);
    } catch (err: any) {
      alert(err.message || 'Failed to form project team');
    } finally {
      setForming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
          <Share2 className="w-3.5 h-3.5" />
          <span>Greedy Set Cover Approximation Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Build a Project Team</h1>
        <p className="text-xs text-slate-500 mt-1">
          Assembles an optimal, cross-functional team that maximizes required skill coverage under team size constraints using Greedy Set Cover.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormTeam} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. LLM Reasoning Agent Infrastructure"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="UI/UX">UI/UX</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Description & Scope</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High level objectives of the project..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Universe of Required Skills (Comma-separated)
          </label>
          <input
            type="text"
            required
            value={requiredSkillsStr}
            onChange={(e) => setRequiredSkillsStr(e.target.value)}
            placeholder="React, TypeScript, Python, PyTorch, Docker, Kubernetes, AWS, PostgreSQL"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="w-48">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Maximum Team Size (K)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={targetTeamSize}
            onChange={(e) => setTargetTeamSize(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={forming}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{forming ? 'Running Set Cover Approximation...' : 'Form Project Team'}</span>
          </button>
        </div>
      </form>

      {/* TEAM RESULTS */}
      {teamResult && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recommended Project Team: {teamResult.actualTeamSize} Members
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Covering {teamResult.totalSkillsCovered} of {teamResult.totalSkillsRequired} required skills ({teamResult.coveragePercentage}%).
              </p>
            </div>

            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Set Cover Runtime: <strong>{teamResult.executionTimeMs} ms</strong>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-slate-500 block mb-1">Skill Coverage</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {teamResult.coveragePercentage}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-slate-500 block mb-1">Skills Covered</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {teamResult.totalSkillsCovered} / {teamResult.totalSkillsRequired}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
              <span className="text-slate-500 block mb-1">Team Size</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {teamResult.actualTeamSize} / {teamResult.targetTeamSize}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block mb-1">Missing Skills</span>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {teamResult.skillsMissing?.length || 0}
              </div>
            </div>
          </div>

          {/* Theoretical Guarantee Note */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p className="leading-relaxed">
              <strong>Approximation Bound:</strong> {teamResult.approximationGuarantee}
            </p>
          </div>

          {/* Team Members Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected Team Members & Contributed Competencies
            </h4>

            <div className="space-y-3">
              {teamResult.teamMembers?.map((m: any) => (
                <div
                  key={m.candidateId}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        #{m.selectionStep}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        {m.candidateName}
                      </h5>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{m.headline || 'Engineer'}</div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Contributes:</span>
                      {m.skillsContributed.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-semibold"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                      +{m.marginalCoverageCount} new skills covered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills Warning */}
          {teamResult.skillsMissing && teamResult.skillsMissing.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Skills Still Uncovered:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {teamResult.skillsMissing.map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs"
                  >
                    ✗ {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
                Consider expanding the candidate search or increasing the target team size K to cover remaining skills.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
