import React from 'react';
import { Sparkles } from 'lucide-react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md', showLabel = false }) => {
  let colorBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  let label = 'Excellent Match';

  if (score >= 85) {
    colorBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    label = 'Excellent Match';
  } else if (score >= 70) {
    colorBg = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
    label = 'Strong Match';
  } else if (score >= 50) {
    colorBg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    label = 'Moderate Match';
  } else {
    colorBg = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800';
    label = 'Partial Match';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colorBg} ${sizeClasses}`}>
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{score.toFixed(1)}%</span>
      {showLabel && <span className="text-xs font-normal opacity-85">({label})</span>}
    </div>
  );
};
