import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Users,
  Search,
  Filter,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';

export const JobManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Job Form State
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Software Engineering');
  const [description, setDescription] = useState('');
  const [openings, setOpenings] = useState('1');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState('Remote');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [minExp, setMinExp] = useState('3.0');
  const [salaryMin, setSalaryMin] = useState('120000');
  const [salaryMax, setSalaryMax] = useState('160000');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('React, TypeScript, Node.js');
  const [preferredSkillsStr, setPreferredSkillsStr] = useState('Next.js, Docker');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await api.get<{ jobs: Job[] }>('/recruiter/jobs');
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const reqSkills = requiredSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, minExpYears: parseFloat(minExp) || 1.0 }));

      const prefSkills = preferredSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      await api.post('/recruiter/jobs', {
        title,
        domain,
        description,
        openings: parseInt(openings),
        location,
        workMode,
        employmentType,
        minExperienceYears: parseFloat(minExp),
        salaryMin: parseInt(salaryMin),
        salaryMax: parseInt(salaryMax),
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
      });

      setShowCreateModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to create job posting');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (job: Job, newStatus: string) => {
    try {
      await api.put(`/recruiter/jobs/${job.id}`, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus as any } : j)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Job Postings Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure recruitment openings, required skill constraints, and view candidate pools.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading job postings...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No jobs found. Click &ldquo;Post New Job&rdquo; to launch your first opening!
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Job Title & Domain</th>
                  <th className="py-4 px-6">Location & Mode</th>
                  <th className="py-4 px-6">Openings</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Applicants</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</div>
                      <div className="text-[11px] text-slate-400">{job.domain}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div>{job.location}</div>
                      <div className="text-[11px] text-slate-400">{job.workMode} • {job.employmentType}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {job.openings}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          job.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {job.stats?.applicants || 0} candidates
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {job.stats?.shortlisted || 0} shortlisted
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                      >
                        Rank Candidates
                      </Link>
                      {job.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleToggleStatus(job, 'PAUSED')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(job, 'ACTIVE')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Job Posting</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Architect"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline core responsibilities and technical expectations..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (Comma-separated — 50% Scoring Weight)
                </label>
                <input
                  type="text"
                  required
                  value={requiredSkillsStr}
                  onChange={(e) => setRequiredSkillsStr(e.target.value)}
                  placeholder="React, TypeScript, Node.js, PostgreSQL"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Skills (Comma-separated — 20% Bonus Weight)
                </label>
                <input
                  type="text"
                  value={preferredSkillsStr}
                  onChange={(e) => setPreferredSkillsStr(e.target.value)}
                  placeholder="Docker, Kubernetes, AWS, Redis"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={openings}
                    onChange={(e) => setOpenings(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Exp (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Min ($)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Max ($)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20"
                >
                  {creating ? 'Publishing...' : 'Publish Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
