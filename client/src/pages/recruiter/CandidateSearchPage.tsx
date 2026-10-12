import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { api } from '../../services/api';
import { SkillTag } from '../../components/common/SkillTag';

export const CandidateSearchPage: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [minExp, setMinExp] = useState('0');

  useEffect(() => {
    fetchCandidates();
  }, [selectedDomain, minExp]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDomain !== 'All') params.append('domain', selectedDomain);
      if (minExp !== '0') params.append('minExp', minExp);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const data = await api.get<{ candidates: any[] }>(`/recruiter/candidates/search?${params.toString()}`);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const domains = ['All', 'Software Engineering', 'AI/ML', 'Data Science', 'Cybersecurity', 'UI/UX'];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Talent Discovery & Candidate Search</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore candidate profiles, canonical skill indexes, and portfolio projects across engineering domains.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, headline, or skill (e.g. PyTorch, React, Penetration Testing)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
          >
            Search Candidates
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Experience</label>
            <select
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
            >
              <option value="0">Any Experience</option>
              <option value="2">2+ Years</option>
              <option value="4">4+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Discovering matching candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No candidates found matching the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {c.user?.fullName}
                    </h2>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      {c.preferredDomain}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {c.yearsOfExperience} yrs exp
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {c.headline || c.careerObjective || 'Professional Software Engineer'}
                </p>

                {/* Skills */}
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Verified Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {c.skills?.slice(0, 7).map((s: any) => (
                      <SkillTag key={s.skillId} name={s.skill.name} size="sm" />
                    ))}
                    {c.skills?.length > 7 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">+{c.skills.length - 7} more</span>
                    )}
                  </div>
                </div>

                {/* Projects */}
                {c.projects && c.projects.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{c.projects[0].title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.projects[0].description}</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location || 'Remote'}</span>
                  <span>•</span>
                  <span>{c.availabilityNotice || 'Immediate'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {c.githubUrl && (
                    <a href={c.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600" title="GitHub">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {c.linkedinUrl && (
                    <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600" title="LinkedIn">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
