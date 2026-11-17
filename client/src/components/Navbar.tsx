import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { DemoSwitcher } from './DemoSwitcher.js';
import { useAuth } from '../context/AuthContext.js';

export function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = 2;

  const isStudent = user?.role === 'student';
  const isRecruiter = user?.role === 'recruiter';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const navLinkClass = (href: string) => `
    inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-all
    ${
      isActive(href)
        ? 'text-[#E42316] font-bold border-b-2 border-[#E42316]'
        : 'text-[#0A0A0A] hover:text-[#E42316]'
    }
  `;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#DEDEDE]">
      <DemoSwitcher />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Editorial Wordmark */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-4 h-4 bg-[#E42316] rotate-45 transition-transform group-hover:rotate-90 duration-300" />
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#0A0A0A] uppercase">
            INTERN<span className="text-[#E42316]">BRIDGE</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#777777] border-l border-[#DEDEDE] pl-2 hidden sm:inline">
            SYSTEM V3
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link to="/internships" className={navLinkClass('/internships')}>
            Explore Internships
          </Link>
          <Link to="/how-it-works" className={navLinkClass('/how-it-works')}>
            How It Works
          </Link>
          <Link to={isStudent ? '/student/agents' : '/features'} className={navLinkClass(isStudent ? '/student/agents' : '/features')}>
            AI Agents
          </Link>
          <Link to="/recruiter/dashboard" className={navLinkClass('/recruiter')}>
            For Recruiters
          </Link>

          {/* Student Portal Shortcuts when signed in */}
          {isStudent && (
            <>
              <div className="h-4 w-px bg-[#DEDEDE] mx-1" />
              <Link to="/student/dashboard" className={navLinkClass('/student/dashboard')}>
                Dashboard
              </Link>
              <Link to="/student/applications" className={navLinkClass('/student/applications')}>
                Applications
              </Link>
              <Link to="/student/interviews" className={navLinkClass('/student/interviews')}>
                Prep
              </Link>
            </>
          )}

          {/* Recruiter Portal Shortcuts when signed in */}
          {isRecruiter && (
            <>
              <div className="h-4 w-px bg-[#DEDEDE] mx-1" />
              <Link to="/recruiter/dashboard" className={navLinkClass('/recruiter/dashboard')}>
                Dashboard
              </Link>
              <Link to="/recruiter/pipeline" className={navLinkClass('/recruiter/pipeline')}>
                Pipeline
              </Link>
              <Link to="/recruiter/internships/new" className={navLinkClass('/recruiter/internships/new')}>
                + Post Role
              </Link>
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={isRecruiter ? '/recruiter/notifications' : '/student/notifications'}
                className="relative p-2 text-[#0A0A0A] hover:text-[#E42316] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E42316]" />
                )}
              </Link>

              <Link
                to={isRecruiter ? '/recruiter/dashboard' : '/student/dashboard'}
                className="flex items-center gap-2 px-3 py-1.5 border border-[#DEDEDE] bg-[#F4F4F2] hover:border-[#0A0A0A] transition-colors"
              >
                <span className="font-mono text-[11px] font-bold text-[#0A0A0A] truncate max-w-[120px]">
                  {user.full_name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1 bg-white border border-[#DEDEDE] text-[#E42316]">
                  {user.role}
                </span>
              </Link>

              <Link
                to="/login"
                className="text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-[#0A0A0A] transition-colors"
              >
                Switch
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-mono uppercase tracking-wider text-[#0A0A0A] hover:text-[#E42316] px-3 py-2 transition-colors font-bold"
              >
                Sign In
              </Link>
              <Link
                to="/register/student"
                className="px-5 py-2.5 bg-[#E42316] hover:bg-[#0A0A0A] text-white font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-[#F4F4F2] border border-[#DEDEDE] text-[#0A0A0A]">
              {user.role}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-[#DEDEDE] text-[#0A0A0A] hover:border-[#0A0A0A]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#E42316]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DEDEDE] bg-white p-6 space-y-4">
          <nav className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-wider">
            <Link
              to="/internships"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0A0A0A] hover:text-[#E42316]"
            >
              Explore Internships
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0A0A0A] hover:text-[#E42316]"
            >
              How It Works
            </Link>
            <Link
              to={isStudent ? '/student/agents' : '/features'}
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0A0A0A] hover:text-[#E42316]"
            >
              AI Agents
            </Link>
            <Link
              to="/recruiter/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0A0A0A] hover:text-[#E42316]"
            >
              For Recruiters
            </Link>
            {isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-[#E42316] font-bold"
                >
                  Student Dashboard
                </Link>
                <Link
                  to="/student/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-[#0A0A0A] hover:text-[#E42316]"
                >
                  My Applications
                </Link>
              </>
            )}
            {isRecruiter && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-[#E42316] font-bold"
                >
                  Recruiter Dashboard
                </Link>
                <Link
                  to="/recruiter/pipeline"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-[#0A0A0A] hover:text-[#E42316]"
                >
                  Candidate Pipeline
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
