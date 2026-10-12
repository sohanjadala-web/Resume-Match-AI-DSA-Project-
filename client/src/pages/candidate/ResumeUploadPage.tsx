import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Save,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { api } from '../../services/api';

export const ResumeUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed review state
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [approvedSkills, setApprovedSkills] = useState<any[]>([]);
  const [savingToProfile, setSavingToProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
        setError('Please upload a valid PDF or DOCX résumé file.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleParse = async () => {
    setError(null);
    setParsing(true);

    try {
      let data: any;

      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        data = await api.post<any>('/candidate/resume', formData);
      } else if (pastedText.trim()) {
        data = await api.post<any>('/candidate/resume', { text: pastedText });
      } else {
        setError('Please select a file or paste résumé text.');
        setParsing(false);
        return;
      }

      setParsedResult(data);
      // Initialize editable skills from extraction
      setApprovedSkills(
        (data.extractedSkills || []).map((s: any) => ({
          skillId: s.skillId,
          skillName: s.canonicalName,
          proficiencyLevel: 'Intermediate',
          yearsOfExperience: 2.0,
          matchedVia: s.matchedVia,
          confidence: s.confidence,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to parse résumé.');
    } finally {
      setParsing(false);
    }
  };

  const handleSaveToProfile = async () => {
    setSavingToProfile(true);
    setSavedSuccess(false);

    try {
      await api.put('/candidate/skills', {
        skills: approvedSkills,
      });

      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile skills.');
    } finally {
      setSavingToProfile(false);
    }
  };

  const removeSkill = (index: number) => {
    setApprovedSkills(approvedSkills.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>Aho-Corasick & Levenshtein Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Résumé Parser & Skill Normalizer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload your document to automatically extract canonical skills, normalize variations (JS → JavaScript, Postgres → PostgreSQL), and structure your profile.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex-1 py-2 rounded-lg transition ${
            uploadMode === 'file'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Upload PDF / DOCX
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('text')}
          className={`flex-1 py-2 rounded-lg transition ${
            uploadMode === 'text'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Paste Plain Text
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      {uploadMode === 'file' ? (
        <div className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center relative hover:border-indigo-400 transition">
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {selectedFile ? selectedFile.name : 'Choose a file or drag & drop here'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF, DOCX, and TXT formats up to 10MB
          </p>

          {selectedFile && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Paste Résumé Text Content
          </label>
          <textarea
            rows={8}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste raw résumé contents here, including Skills, Experience, and Education sections..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      )}

      {/* Parse Trigger Button */}
      <div className="flex justify-center">
        <button
          onClick={handleParse}
          disabled={parsing || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'text' && !pastedText.trim())}
          className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{parsing ? 'Parsing with Aho-Corasick & Levenshtein...' : 'Extract & Normalize Skills'}</span>
        </button>
      </div>

      {/* PARSED RESULTS REVIEW FORM */}
      {parsedResult && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Extracted Skills Review Form
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve normalized skills before committing them to your live profile.
              </p>
            </div>

            {/* Runtime Telemetry */}
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>DSA Runtime: <strong>{parsedResult.executionTimeMs} ms</strong></span>
            </div>
          </div>

          {/* Canonical Skills List */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Detected Skills ({approvedSkills.length})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {approvedSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{skill.skillName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {skill.matchedVia?.replace('_', ' ').toLowerCase()} ({Math.round(skill.confidence * 100)}%)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section preview */}
          {parsedResult.sections && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Extracted Sections Summary
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Experience Text</span>
                  <p className="text-[11px] text-slate-500 line-clamp-3">
                    {parsedResult.sections.experienceText || 'Detected in body'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Education Text</span>
                  <p className="text-[11px] text-slate-500 line-clamp-3">
                    {parsedResult.sections.educationText || 'Detected in body'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Projects Text</span>
                  <p className="text-[11px] text-slate-500 line-clamp-3">
                    {parsedResult.sections.projectsText || 'Detected in body'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save to Profile Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile skills updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Ready to sync with candidate database?</span>
            )}

            <button
              onClick={handleSaveToProfile}
              disabled={savingToProfile || approvedSkills.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingToProfile ? 'Syncing...' : 'Approve & Save to Profile'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
