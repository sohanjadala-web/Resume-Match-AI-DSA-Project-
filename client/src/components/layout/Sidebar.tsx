import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Compass,
  BookmarkCheck,
  Send,
  Briefcase,
  Users,
  Target,
  Share2,
  ShieldCheck,
  Activity,
  History,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { role } = useAuth();

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/candidate/profile', icon: User, label: 'My Profile' },
    { to: '/candidate/resume', icon: FileText, label: 'Resume Parser' },
    { to: '/candidate/recommendations', icon: Compass, label: 'Job Matches' },
    { to: '/candidate/applications', icon: Send, label: 'Applications' },
    { to: '/candidate/saved-jobs', icon: BookmarkCheck, label: 'Saved Jobs' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Job Postings' },
    { to: '/recruiter/candidates', icon: Users, label: 'Candidate Search' },
    { to: '/recruiter/talent-allocation', icon: Target, label: 'Talent Allocation (Hungarian)' },
    { to: '/recruiter/team-builder', icon: Share2, label: 'Build Project Team (Set Cover)' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Platform Overview' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Job Audit' },
    { to: '/admin/dsa-insights', icon: Activity, label: 'DSA Insights & Runtime' },
    { to: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
  ];

  let links = candidateLinks;
  if (role === 'RECRUITER') links = recruiterLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <aside
      className={`relative border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Role Title Badge */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {role} PORTAL
            </div>
            <div className="text-xs text-slate-400">ResumeMatch Engine</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition mx-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer link to DSA Playground */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <NavLink
          to="/playground"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition ${
              isActive ? 'bg-indigo-50 dark:bg-indigo-950/40 font-bold' : ''
            } ${isCollapsed ? 'justify-center px-2' : ''}`
          }
          title={isCollapsed ? 'DSA Playground' : undefined}
        >
          <Cpu className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>DSA Playground</span>}
        </NavLink>
      </div>
    </aside>
  );
};
