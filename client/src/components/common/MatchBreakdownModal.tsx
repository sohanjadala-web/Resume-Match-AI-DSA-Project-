import React from 'react';
import { X, CheckCircle2, AlertCircle, Cpu, Award, Briefcase, GraduationCap, Compass } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

interface MatchBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  score: number;
  breakdown?: {
    requiredSkillsScore: number;
    preferredSkillsScore: number;
    experienceScore: number;
    domainProjectScore: number;
    educationScore: number;
  };
  matchingRequired: string[];
  missingRequired: string[];
  matchingPreferred: string[];
  explanation?: string;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  score,
  breakdown,
  matchingRequired,
  missingRequired,
  matchingPreferred,
  explanation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                DSA Compatibility Scorer Engine
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Why You Match: {jobTitle}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Overall Match Highlight */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Compatibility Score</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated using 5 normalized algorithmic factors</div>
            </div>
            <ScoreBadge score={score} size="lg" showLabel />
          </div>

          {/* Transparent Explanation */}
          {explanation && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Algorithmic Assessment
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{explanation}</p>
            </div>
          )}

          {/* Factor Breakdown Weights */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Multi-Factor Score Composition
            </h4>

            {/* 1. Required Skills (50%) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Required Skills Coverage (50% Weight)
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {breakdown?.requiredSkillsScore ?? 0} / 50 pts
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((breakdown?.requiredSkillsScore ?? 0) / 50) * 100}%` }}
                />
              </div>

              {/* Matched & Missing Chips */}
              <div className="space-y-2 text-xs">
                {matchingRequired.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Matched:</span>
                    {matchingRequired.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}
                {missingRequired.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Missing:</span>
                    {missingRequired.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All required skills fulfilled!
                  </div>
                )}
              </div>
            </div>

            {/* 2. Preferred Skills (20%) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Preferred Skills Bonus (20% Weight)
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {breakdown?.preferredSkillsScore ?? 0} / 20 pts
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((breakdown?.preferredSkillsScore ?? 0) / 20) * 100}%` }}
                />
              </div>
              {matchingPreferred.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Matching bonus:</span>
                  {matchingPreferred.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                      ★ {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Experience, Domain, Qualifications */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Experience (15%)
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {breakdown?.experienceScore ?? 0} <span className="text-xs font-normal text-slate-400">/ 15</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                  <Compass className="w-3.5 h-3.5 text-purple-500" /> Domain & Projects (10%)
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {breakdown?.domainProjectScore ?? 0} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> Qualifications (5%)
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {breakdown?.educationScore ?? 0} <span className="text-xs font-normal text-slate-400">/ 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
