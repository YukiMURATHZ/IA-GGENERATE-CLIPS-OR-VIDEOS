import React from 'react';
import {
  Sparkles,
  Folder,
  Film,
  Settings,
  Database,
  CheckCircle2,
  Zap,
  LogIn,
  LogOut,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'generate' | 'projects' | 'library' | 'settings';
  setCurrentTab: (tab: 'generate' | 'projects' | 'library' | 'settings') => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  stats: {
    totalProjects: number;
    totalClips: number;
  };
}

interface NavItem {
  id: 'generate' | 'projects' | 'library' | 'settings';
  label: string;
  icon: any;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onLogin,
  onLogout,
  stats,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'generate',
      label: 'Generar Clips',
      icon: Sparkles,
      badge: 'IA 2.0',
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: Folder,
      count: stats.totalProjects,
    },
    {
      id: 'library',
      label: 'Biblioteca',
      icon: Film,
      count: stats.totalClips,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-400 p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-purple-300 bg-clip-text text-transparent">
                ClipPulse
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Auto AI Video Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-zinc-300 uppercase">
          Menú Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-purple-400' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-mono">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Stats Banner */}
        <div className="pt-6 px-1">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-purple-950/20 border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-medium">Clips Virales</span>
              <span className="text-purple-400 font-semibold">{stats.totalClips} generados</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, stats.totalClips * 12))}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Algoritmo de retención activo
            </p>
          </div>
        </div>
      </nav>

      {/* Cloud SQL connection badge & User Profile footer */}
      <div className="p-3 border-t border-zinc-800/60 bg-zinc-950/60 space-y-2.5">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-[11px]">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Cloud SQL Postgres</span>
          </div>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Activo
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={
                user?.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user?.displayName || 'Alex Rivera'}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {user?.email || 'creator@clippulse.ai'}
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onLogin}
              title="Iniciar sesión con Google"
              className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
