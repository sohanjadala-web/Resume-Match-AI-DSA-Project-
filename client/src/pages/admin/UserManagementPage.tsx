import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, UserX, UserCheck, Mail, Phone } from 'lucide-react';
import { api } from '../../services/api';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search.trim()) params.append('search', search.trim());

      const data = await api.get<{ users: any[] }>(`/admin/users?${params.toString()}`);
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUserStatus = async (user: any) => {
    try {
      const newStatus = !user.isActive;
      await api.patch(`/admin/users/${user.id}/status`, { isActive: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">User Accounts & Access Control</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect registered candidate and recruiter profiles, manage access permissions, and activate/deactivate accounts.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-semibold text-slate-500 text-[11px]">Role:</span>
          {['', 'CANDIDATE', 'RECRUITER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {r ? r.charAt(0) + r.slice(1).toLowerCase() : 'All Users'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading user accounts...</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No users match the search parameters.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">Role & Metadata</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Account Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{u.fullName}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {u.role}
                      </span>
                      {u.candidateProfile?.preferredDomain && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          {u.candidateProfile.preferredDomain} ({u.candidateProfile.yearsOfExperience}y)
                        </div>
                      )}
                      {u.recruiterProfile?.company && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          {u.recruiterProfile.company.name}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      {u.phone || 'No phone recorded'}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${u.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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
    </div>
  );
};
