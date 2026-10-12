import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [careerObjective, setCareerObjective] = useState('');
  const [preferredDomain, setPreferredDomain] = useState('Software Engineering');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [location, setLocation] = useState('');
  const [preferredWorkMode, setPreferredWorkMode] = useState('Remote');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [expectedSalaryMin, setExpectedSalaryMin] = useState('');
  const [expectedSalaryMax, setExpectedSalaryMax] = useState('');
  const [availabilityNotice, setAvailabilityNotice] = useState('Immediate');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [newSkillExp, setNewSkillExp] = useState('2');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get<{ profile: any }>('/candidate/profile');
      const p = data.profile;
      setProfile(p);
      setFullName(p.user?.fullName || '');
      setHeadline(p.headline || '');
      setCareerObjective(p.careerObjective || '');
      setPreferredDomain(p.preferredDomain || 'Software Engineering');
      setYearsOfExperience(String(p.yearsOfExperience || 0));
      setLocation(p.location || '');
      setPreferredWorkMode(p.preferredWorkMode || 'Remote');
      setEmploymentType(p.employmentType || 'Full-time');
      setExpectedSalaryMin(p.expectedSalaryMin ? String(p.expectedSalaryMin) : '');
      setExpectedSalaryMax(p.expectedSalaryMax ? String(p.expectedSalaryMax) : '');
      setAvailabilityNotice(p.availabilityNotice || 'Immediate');
      setPortfolioUrl(p.portfolioUrl || '');
      setGithubUrl(p.githubUrl || '');
      setLinkedinUrl(p.linkedinUrl || '');

      setSkills(
        p.skills?.map((s: any) => ({
          skillId: s.skillId,
          skillName: s.skill?.name,
          proficiencyLevel: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience,
        })) || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await api.put('/candidate/profile', {
        fullName,
        headline,
        careerObjective,
        preferredDomain,
        yearsOfExperience: parseFloat(yearsOfExperience),
        location,
        preferredWorkMode,
        employmentType,
        expectedSalaryMin: expectedSalaryMin ? parseInt(expectedSalaryMin) : undefined,
        expectedSalaryMax: expectedSalaryMax ? parseInt(expectedSalaryMax) : undefined,
        availabilityNotice,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
      });

      // Save skills
      await api.put('/candidate/skills', {
        skills,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchProfile();
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        skillName: newSkillName.trim(),
        proficiencyLevel: newSkillLevel,
        yearsOfExperience: parseFloat(newSkillExp) || 1,
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading professional profile...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Professional Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your credentials, validated competencies, and career objectives for the DSA matcher.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Information Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Personal & Career Summary</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Engineering Domain
              </label>
              <select
                value={preferredDomain}
                onChange={(e) => setPreferredDomain(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer | React, TypeScript, Node.js"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Career Objective & Technical Statement
            </label>
            <textarea
              rows={3}
              value={careerObjective}
              onChange={(e) => setCareerObjective(e.target.value)}
              placeholder="Describe your architectural background and ideal engineering challenge..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Work Mode
              </label>
              <select
                value={preferredWorkMode}
                onChange={(e) => setPreferredWorkMode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Availability Notice
              </label>
              <select
                value={availabilityNotice}
                onChange={(e) => setAvailabilityNotice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Immediate">Immediate</option>
                <option value="15 Days">15 Days</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technical Skills Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Technical Skills Inventory (Aho-Corasick Index)</span>
            </div>
            <span className="text-xs text-slate-400">{skills.length} skills indexed</span>
          </div>

          {/* Add Skill Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. React, Python, Docker)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="Years"
              value={newSkillExp}
              onChange={(e) => setNewSkillExp(e.target.value)}
              className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Skills Badges List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{s.skillName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium">
                  {s.proficiencyLevel} ({s.yearsOfExperience}y)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Links & Portfolio */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
            <ExternalLink className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Professional Presence & Links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Personal Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
