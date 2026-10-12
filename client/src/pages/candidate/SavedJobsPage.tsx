import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Send, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';
import { SkillTag } from '../../components/common/SkillTag';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const data = await api.get<{ savedJobs: any[] }>('/candidate/saved-jobs');
      setSavedJobs(data.savedJobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      await api.delete(`/candidate/jobs/${jobId}/save`);
      setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Saved Job Bookmarks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review saved positions and submit applications when you are ready.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading saved bookmarks...</div>
      ) : savedJobs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No saved jobs yet. Browse recommended positions and click the bookmark icon to save roles!
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((item) => {
            const job: Job = item.job;
            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {job.domain}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{job.company?.name}</span>
                    <span>•</span>
                    <span>{job.location} ({job.workMode})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {job.requiredSkills?.map((s) => (
                      <SkillTag key={s.skillId} name={s.skill.name} size="sm" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
