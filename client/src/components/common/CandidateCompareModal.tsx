import React from 'react';
import { X, Check, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

interface CompareCandidateItem {
  id: string;
  name: string;
  headline?: string;
  experienceYears: number;
  compatibilityScore: number;
  matchingRequiredSkills: string[];
  missingRequiredSkills: string[];
  education?: string;
  projectsCount: number;
  status: string;
}

interface CandidateCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  candidates: CompareCandidateItem[];
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  candidates,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                Multi-Candidate Side-by-Side Comparison
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Comparing {candidates.length} Candidates for {jobTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regulatory & Ethical Notice */}
        <div className="px-6 py-2.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/40 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Decision Integrity Notice:</strong> Compatibility percentages are algorithmic recommendations. Hiring decisions remain strictly under human control and should consider comprehensive interview evaluations.
          </span>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-400 uppercase text-xs w-48">Evaluation Metric</th>
                {candidates.map((c) => (
                  <th key={c.id} className="py-3 px-4 min-w-[200px]">
                    <div className="font-bold text-slate-900 dark:text-white text-base">{c.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{c.headline || 'Candidate'}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {/* Compatibility Score */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">Compatibility Score</td>
                {candidates.map((c) => (
                  <td key={c.id} className="py-4 px-4">
                    <ScoreBadge score={c.compatibilityScore} size="md" showLabel />
                  </td>
                ))}
              </tr>

              {/* Status */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">Hiring Status</td>
                {candidates.map((c) => (
                  <td key={c.id} className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">Total Experience</td>
                {candidates.map((c) => (
                  <td key={c.id} className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                    {c.experienceYears} Years
                  </td>
                ))}
              </tr>

              {/* Matched Required Skills */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">Required Skills Matched</td>
                {candidates.map((c) => (
                  <td key={c.id} className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.matchingRequiredSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> {s}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Missing Skills */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">Critical Missing Skills</td>
                {candidates.map((c) => (
                  <td key={c.id} className="py-4 px-4">
                    {c.missingRequiredSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.missingRequiredSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> None (100% Covered)
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Education */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">Education</td>
                {candidates.map((c) => (
                  <td key={c.id} className="py-4 px-4 text-xs text-slate-700 dark:text-slate-300">
                    {c.education || 'Bachelor Degree in CS / Engineering'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
