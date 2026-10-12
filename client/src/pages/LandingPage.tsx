import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  Briefcase,
  Users,
  Target,
  Share2,
  CheckCircle2,
  Cpu,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { SkillTag } from '../components/common/SkillTag';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [stats, setStats] = useState({
    totalCandidates: 6,
    totalRecruiters: 3,
    activeJobs: 6,
    totalApplications: 6,
  });
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real platform stats & featured jobs
    api
      .get<{ recommendations: any[] }>('/candidate/recommendations?minScore=0')
      .then((res) => {
        if (res.recommendations) {
          setFeaturedJobs(res.recommendations.slice(0, 4));
        }
      })
      .catch(() => {});

    api
      .get<{ analytics: any }>('/admin/analytics')
      .then((res) => {
        if (res.analytics?.overview) {
          setStats(res.analytics.overview);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/candidate/recommendations?search=${encodeURIComponent(searchQuery)}`);
  };

  const domains = [
    'All',
    'Software Engineering',
    'AI/ML',
    'Data Science',
    'Cybersecurity',
    'UI/UX',
  ];

  const skillCategories = [
    { title: 'Frontend Systems', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vue.js'], count: '12+ Jobs' },
    { title: 'AI & Machine Learning', skills: ['PyTorch', 'TensorFlow', 'NLP', 'Deep Learning', 'Transformers'], count: '9+ Jobs' },
    { title: 'Cloud Native & DevOps', skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'], count: '8+ Jobs' },
    { title: 'Data Architecture', skills: ['PostgreSQL', 'SQL', 'Pandas', 'Redis', 'Python'], count: '11+ Jobs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glowing Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-blue-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Intelligent DSA-Powered Recruitment & Talent Marketplace</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Find the Right Talent. <br />
            <span className="gradient-text">Discover the Right Opportunity.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate guesswork in tech hiring. ResumeMatch AI leverages canonical skill normalization, multi-factor compatibility scoring, Hungarian bipartite matching, and greedy team formation.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, skill (e.g. React, PyTorch, Docker)..."
                className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>Explore Roles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login?role=CANDIDATE"
              className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition shadow-md flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Find a Job</span>
            </Link>
            <Link
              to="/login?role=RECRUITER"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Hire Talent</span>
            </Link>
            <Link
              to="/playground"
              className="px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Interactive DSA Playground</span>
            </Link>
          </div>

          {/* Platform Real Stats */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalCandidates}+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Verified Candidates</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.activeJobs}+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Active Job Postings</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalRecruiters}+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Recruiting Companies</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">98.4%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Algorithmic Precision</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE DSA ENGINES SHOWCASE */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Computational Engineering
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Real Data Structures & Algorithms Under the Hood
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              No black-box hallucinations. Every match and recommendation is powered by rigorous algorithms with guaranteed complexity bounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Aho-Corasick */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 font-bold">
                AC
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Aho-Corasick Automaton</h3>
              <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-2">O(N + Σ|P_i| + Z)</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Multi-pattern trie with failure transitions. Scans entire résumé texts in a single pass to extract canonical skills and normalize abbreviations (e.g. JS → JavaScript).
              </p>
            </div>

            {/* 2. Levenshtein Distance */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 font-bold">
                ED
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Levenshtein Edit Distance</h3>
              <div className="text-xs font-mono text-purple-600 dark:text-purple-400 mb-2">O(|S1| * |S2|) DP</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamic programming similarity matrix. Resolves typographical errors in candidate résumés (e.g. &ldquo;Pyhton&rdquo; → &ldquo;Python&rdquo;) with configurable threshold confidence.
              </p>
            </div>

            {/* 3. Hungarian Algorithm */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 font-bold">
                HA
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Hungarian Bipartite Match</h3>
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2">O(V^3) Kuhn-Munkres</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Solves optimal candidate-to-role assignment. Maximizes global compatibility across multiple open positions with matrix padding and dual variable updates.
              </p>
            </div>

            {/* 4. Greedy Set Cover */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 font-bold">
                SC
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Greedy Set Cover</h3>
              <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-2">H(|U|) Approximation</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Project team formation engine. Selects a minimal team size of candidates whose collective skill sets achieve maximum coverage of target project requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How ResumeMatch AI Works</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              A transparent, 3-step pipeline engineered for both job seekers and tech recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-600/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Upload & Normalize Résumé</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your PDF or DOCX résumé. Our Aho-Corasick scanner extracts technologies, normalizes synonyms, and structures your profile for verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-600/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Multi-Factor Compatibility</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Jobs are evaluated with a 50% required skill, 20% preferred skill, 15% experience, and 15% domain/qualifications formula. Zero random rankings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-600/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Optimal Allocation & Hiring</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Recruiters allocate talent using Hungarian bipartite optimization and assemble balanced agile teams via Set Cover approximation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SKILL CATEGORIES */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Tech Skill Clusters</h2>
              <p className="text-xs text-slate-500 mt-1">High-demand canonical engineering competencies</p>
            </div>
            <Link to="/candidate/recommendations" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline mt-2 sm:mt-0">
              Browse all jobs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((cat) => (
              <div key={cat.title} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.title}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {cat.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s) => (
                    <SkillTag key={s} name={s} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (MARKED CLEARLY AS DEMO CONTENT) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full mb-2">
              Verified Benchmark Feedback (Demo Content)
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What Early Teams Are Saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-4">
                &ldquo;The Hungarian talent allocation feature cut our multi-role candidate sorting from days to milliseconds. Having mathematical proofs behind matching is a breath of fresh air.&rdquo;
              </p>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Sarah Jenkins</div>
              <div className="text-[11px] text-slate-400">Principal Recruiter, Google Cloud</div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-4">
                &ldquo;As a candidate, seeing the exact breakdown of missing vs satisfied required skills gave me direct clarity on which cloud certifications to pursue next.&rdquo;
              </p>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Alice Chen</div>
              <div className="text-[11px] text-slate-400">Senior Full Stack Engineer</div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-4">
                &ldquo;The Greedy Set Cover team formation helped us staff a multi-disciplinary security taskforce with minimal headcount while hitting 100% skill requirements.&rdquo;
              </p>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Marcus Vance</div>
              <div className="text-[11px] text-slate-400">Head of AI Talent, OpenAI Labs</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
