import React, { useState, useEffect } from 'react';
import { History, Shield, Clock, FileText, User } from 'lucide-react';
import { api } from '../../services/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ logs: any[] }>('/admin/audit-logs')
      .then((res) => setLogs(res.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Audit & Governance Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable event log of consequential administrative actions, hiring status changes, and platform interventions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading audit log stream...</div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">Actor / User</th>
                  <th className="py-3.5 px-5">Action Performed</th>
                  <th className="py-3.5 px-5">Target Entity</th>
                  <th className="py-3.5 px-5">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                      {log.user ? `${log.user.fullName} (${log.user.role})` : 'System Engine'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {log.targetModel} {log.targetId ? `(#${log.targetId.slice(0, 8)})` : ''}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {log.metadataJson || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
