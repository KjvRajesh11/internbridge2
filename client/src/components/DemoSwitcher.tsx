import React, { useState } from 'react';
import { Briefcase, GraduationCap, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function DemoSwitcher() {
  const navigate = useNavigate();
  const { user, switchPersona, activeUserId } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSwitch = async (userId: string, targetPath?: string) => {
    if (loading || activeUserId === userId) return;
    setLoading(true);
    try {
      await switchPersona(userId);
      if (targetPath) {
        navigate(targetPath);
      }
    } finally {
      setLoading(false);
    }
  };

  const users = [
    {
      id: 's1000000-0000-0000-0000-000000000001',
      name: 'Priya Sharma',
      role: 'Student',
      detail: 'NIT 2026 • 8.85 GPA',
      targetPath: '/student/dashboard',
      icon: GraduationCap,
    },
    {
      id: 's2000000-0000-0000-0000-000000000002',
      name: 'Rohan Mehta',
      role: 'Student',
      detail: 'IIT 2026 • 7.80 GPA',
      targetPath: '/student/dashboard',
      icon: GraduationCap,
    },
    {
      id: 'r1000000-0000-0000-0000-000000000001',
      name: 'Alex Rivera',
      role: 'Recruiter',
      detail: 'CloudScale Technologies',
      targetPath: '/recruiter/dashboard',
      icon: Briefcase,
    },
    {
      id: 'r2000000-0000-0000-0000-000000000002',
      name: 'Marcus Vance',
      role: 'Recruiter',
      detail: 'Nova Health AI',
      targetPath: '/recruiter/dashboard',
      icon: Briefcase,
    },
  ];

  return (
    <div className="bg-[#0A0A0A] border-b border-[#222222] text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-white">
        <span className="flex h-1.5 w-1.5 rounded-full bg-[#E42316] animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#777777]">Persona:</span>
        <span className="text-white font-medium">
          <strong className="text-white font-bold">{user?.full_name || 'Loading...'}</strong>{' '}
          <span className="text-[#E42316] font-mono text-[11px] uppercase">[{user?.role || '...'}]</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[#777777] mr-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
          <ArrowRightLeft className="w-3 h-3 text-[#E42316]" /> Switch:
        </span>
        {users.map((u) => {
          const isActive = activeUserId === u.id;
          const Icon = u.icon;
          return (
            <button
              key={u.id}
              onClick={() => handleSwitch(u.id, u.targetPath)}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase transition-all border ${
                isActive
                  ? 'bg-[#E42316] text-white border-[#E42316] font-bold shadow-xs'
                  : 'bg-[#151515] text-[#999999] border-[#2A2A2A] hover:border-[#E42316] hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{u.name}</span>
              <span className="text-[10px] opacity-75">({u.role})</span>
              {isActive && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DemoSwitcher;
