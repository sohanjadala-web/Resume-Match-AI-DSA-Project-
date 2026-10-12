import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-500 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                ResumeMatch <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Next-generation recruitment platform powered by verified Data Structures & Algorithms. Connecting exceptional talent with premier engineering teams.
            </p>
          </div>

          {/* DSA Engines */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Core DSA Engines
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-xs">
                <Terminal className="w-3 h-3 text-indigo-500" /> Aho-Corasick Multi-Pattern Search
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <Terminal className="w-3 h-3 text-indigo-500" /> Levenshtein Edit Distance (DP)
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <Terminal className="w-3 h-3 text-indigo-500" /> Hungarian Max Bipartite Matching
              </li>
              <li className="flex items-center gap-1.5 text-xs">
                <Terminal className="w-3 h-3 text-indigo-500" /> Greedy Set Cover Team Formation
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Role Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login?role=CANDIDATE" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Candidate Portal & Resume Upload
                </Link>
              </li>
              <li>
                <Link to="/login?role=RECRUITER" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Recruiter Portal & Talent Allocation
                </Link>
              </li>
              <li>
                <Link to="/login?role=ADMIN" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Admin Portal & DSA Telemetry
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Interactive Algorithm Playground
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Security & Fairness
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Unbiased AI Scoring
              </div>
              <p>
                Scores exclude all protected characteristics. Final employment decisions remain under complete human governance.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; {new Date().getFullYear()} ResumeMatch AI Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-indigo-500 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-indigo-500 cursor-pointer">Terms of Service</span>
            <span className="hover:text-indigo-500 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
