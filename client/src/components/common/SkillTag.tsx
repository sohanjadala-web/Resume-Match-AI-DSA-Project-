import React from 'react';
import { Check, X } from 'lucide-react';

interface SkillTagProps {
  name: string;
  category?: string;
  isMatched?: boolean;
  isMissing?: boolean;
  size?: 'sm' | 'md';
}

export const SkillTag: React.FC<SkillTagProps> = ({
  name,
  isMatched,
  isMissing,
  size = 'md',
}) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (isMatched) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  } else if (isMissing) {
    style = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border ${style} ${sizeClass}`}>
      {isMatched && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
      {isMissing && <X className="w-3 h-3 text-rose-600 dark:text-rose-400" />}
      <span>{name}</span>
    </span>
  );
};
