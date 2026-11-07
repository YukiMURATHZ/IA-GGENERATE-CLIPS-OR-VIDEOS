import React from 'react';
import { Sparkles, Plus, Bell, ShieldCheck, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  currentTab: 'generate' | 'projects' | 'library' | 'settings';
  onNewProjectClick: () => void;
  user: any;
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNewProjectClick,
  user,
  onLogin,
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    generate: {
      title: 'Generador de Clips con Inteligencia Artificial',
      subtitle: 'Sube un video largo o prueba un sample para extraer los ganchos más virales en formato 9:16.',
    },
    projects: {
      title: 'Tus Proyectos',
      subtitle: 'Historial completo de videos analizados y almacenados en Cloud SQL PostgreSQL.',
    },
    library: {
      title: 'Biblioteca de Clips Virales',
      subtitle: 'Todos tus clips listos para descargar, editar subtítulos o publicar en redes sociales.',
    },
    settings: {
      title: 'Configuración del Estudio',
      subtitle: 'Personaliza los estilos de subtítulos karaoke, auto-framing y resolución de renderizado.',
    },
  };

  const current = titles[currentTab] || titles.generate;

  return (
    <header className="h-20 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {currentTab !== 'generate' && (
          <button
            onClick={onNewProjectClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Video</span>
          </button>
        )}

        {!user ? (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-medium transition-all"
          >
            <UserIcon className="w-4 h-4 text-purple-400" />
            <span>Acceder con Google</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-purple-500/30 text-xs text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Sesión Activa</span>
          </div>
        )}
      </div>
    </header>
  );
};
