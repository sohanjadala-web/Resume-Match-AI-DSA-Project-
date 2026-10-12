import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  Target,
  Share2,
} from 'lucide-react';
import { api } from '../services/api';

export const DSAPlaygroundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aho-corasick' | 'kmp' | 'edit-distance' | 'hungarian' | 'set-cover'>('aho-corasick');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Playground inputs
  const [acPatterns, setAcPatterns] = useState('React, TypeScript, Docker, Kubernetes, Python');
  const [acText, setAcText] = useState('Senior engineer proficient with React, TypeScript, and Docker microservices on AWS.');

  const [kmpText, setKmpText] = useState('The platform uses KMP for exact substring search and rapid pattern validation.');
  const [kmpPattern, setKmpPattern] = useState('KMP');

  const [edStr1, setEdStr1] = useState('Pyhton');
  const [edStr2, setEdStr2] = useState('Python');

  const [scSkills, setScSkills] = useState('React, Python, Docker, AWS, Kubernetes, Figma');
  const [scTeamSize, setScTeamSize] = useState('3');

  const handleRunAlgorithm = async () => {
    setRunning(true);
    setResult(null);

    try {
      let params: any = {};
      if (activeTab === 'aho-corasick') {
        params = {
          patterns: acPatterns.split(',').map((p) => p.trim()).filter(Boolean),
          text: acText,
        };
      } else if (activeTab === 'kmp') {
        params = { text: kmpText, pattern: kmpPattern };
      } else if (activeTab === 'edit-distance') {
        params = { str1: edStr1, str2: edStr2 };
      } else if (activeTab === 'hungarian') {
        params = {};
      } else if (activeTab === 'set-cover') {
        params = {
          requiredSkills: scSkills.split(',').map((s) => s.trim()).filter(Boolean),
          teamSize: parseInt(scTeamSize),
        };
      }

      const data = await api.post<any>('/dsa/playground/run', {
        algorithm: activeTab,
        params,
      });

      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const tabs = [
    { id: 'aho-corasick', label: '1. Aho-Corasick Automaton', tag: 'O(N + Σ|P|)' },
    { id: 'kmp', label: '2. Knuth-Morris-Pratt (KMP)', tag: 'O(N + M)' },
    { id: 'edit-distance', label: '3. Levenshtein Edit Distance', tag: 'O(N * M) DP' },
    { id: 'hungarian', label: '4. Hungarian Bipartite Match', tag: 'O(V³)' },
    { id: 'set-cover', label: '5. Greedy Set Cover', tag: 'H(|U|) Approx' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-16">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>Interactive Algorithm Workbench</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Live DSA Playground & Telemetry
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Test our core data structures and algorithms in real time. Inspect internal state, time complexities, and measured hardware latencies on custom inputs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as any);
              setResult(null);
            }}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-mono">
              {t.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Interactive Input Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        {activeTab === 'aho-corasick' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Multi-Pattern Dictionary (Comma-separated skills to build Trie & Fail Links)
              </label>
              <input
                type="text"
                value={acPatterns}
                onChange={(e) => setAcPatterns(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Candidate Document / Résumé Body Text
              </label>
              <textarea
                rows={3}
                value={acText}
                onChange={(e) => setAcText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'kmp' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Input Text to Search
              </label>
              <textarea
                rows={2}
                value={kmpText}
                onChange={(e) => setKmpText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Pattern to Locate (Computes LPS table)
              </label>
              <input
                type="text"
                value={kmpPattern}
                onChange={(e) => setKmpPattern(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'edit-distance' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target String 1 (e.g. Typo in Résumé)
              </label>
              <input
                type="text"
                value={edStr1}
                onChange={(e) => setEdStr1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canonical Dictionary String 2
              </label>
              <input
                type="text"
                value={edStr2}
                onChange={(e) => setEdStr2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'hungarian' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Sample 3x3 Bipartite Role-Candidate Matching
            </span>
            <p>
              Simulates bipartite matching between Frontend Lead (Google), ML Specialist (OpenAI), and Security Engineer (Stripe) across 3 candidate skill vectors using Kuhn-Munkres potential updates.
            </p>
          </div>
        )}

        {activeTab === 'set-cover' && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Skill Universe U (Comma-separated)
              </label>
              <input
                type="text"
                value={scSkills}
                onChange={(e) => setScSkills(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div className="w-44">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Team Size K</label>
              <input
                type="number"
                min="1"
                max="8"
                value={scTeamSize}
                onChange={(e) => setScTeamSize(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunAlgorithm}
            disabled={running}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{running ? 'Executing...' : 'Execute Algorithm'}</span>
          </button>
        </div>
      </div>

      {/* Execution Results View */}
      {result && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in slide-in-from-bottom-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {result.algorithmName || result.algorithm}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                Time: {result.timeComplexity} | Space: {result.spaceComplexity}
              </div>
            </div>

            <div className="text-xs font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold">
              Measured Runtime: {result.executionTimeMs} ms
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-80">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
