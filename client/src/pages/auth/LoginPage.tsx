import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, User, Briefcase, Shield, AlertCircle, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, role: userRole } = useAuth();

  const initialRole = (searchParams.get('role') as UserRole) || 'CANDIDATE';
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'ADMIN') navigate('/admin/dashboard');
      else if (userRole === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/candidate/dashboard');
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password, role: selectedRole });
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts quick-fill
  const handleQuickLogin = (demoEmail: string, demoPass: string, roleToSet: UserRole) => {
    setSelectedRole(roleToSet);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              ResumeMatch <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">Select your portal role to continue</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedRole('CANDIDATE')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'CANDIDATE'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('RECRUITER')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'RECRUITER'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiter</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'ADMIN'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'ADMIN'
                    ? 'admin@resumematch.ai'
                    : selectedRole === 'RECRUITER'
                    ? 'recruiter.google@resumematch.ai'
                    : 'alice.swe@resumematch.ai'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : `Sign in to ${selectedRole.toLowerCase()} portal`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Access Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('alice.swe@resumematch.ai', 'Password@123', 'CANDIDATE')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition text-center"
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('recruiter.google@resumematch.ai', 'Password@123', 'RECRUITER')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition text-center"
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@resumematch.ai', 'AdminPass@2026', 'ADMIN')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer Registration Link */}
        {selectedRole !== 'ADMIN' && (
          <div className="mt-5 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to={`/register?role=${selectedRole}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Register as {selectedRole.toLowerCase()}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
