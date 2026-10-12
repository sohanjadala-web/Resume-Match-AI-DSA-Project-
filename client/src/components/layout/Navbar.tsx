import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Cpu,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, theme, toggleTheme, role } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get<{ notifications: Notification[]; unreadCount: number }>('/notifications')
        .then((res) => {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'RECRUITER') return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ResumeMatch <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-1 flex items-center gap-1">
              <span>DSA-Powered Engine</span>
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Home
          </Link>
          <Link to="/playground" className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>DSA Playground</span>
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-semibold text-indigo-600 dark:text-indigo-400"
            >
              <Layers className="w-4 h-4" />
              <span>{role ? role.charAt(0) + role.slice(1).toLowerCase() : ''} Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="py-2.5">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{user?.fullName}</div>
                  <div className="text-slate-400 text-[10px] capitalize">{role?.toLowerCase()}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{user?.fullName}</div>
                    <div className="text-slate-400 truncate">{user?.email}</div>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Layers className="w-4 h-4 text-indigo-500" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout().then(() => navigate('/'));
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
