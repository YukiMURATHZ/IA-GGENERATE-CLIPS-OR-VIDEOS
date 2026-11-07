import React from 'react';
import {
  Folder,
  Plus,
  Trash2,
  ExternalLink,
  Film,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types.ts';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProject: (projectId: number) => void;
  onDeleteProject: (projectId: number) => void;
  onNewProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onNewProject,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Proyectos en Cloud SQL</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {projects.length} {projects.length === 1 ? 'proyecto guardado' : 'proyectos guardados'} en PostgreSQL
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Folder className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No tienes proyectos todavía</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Sube tu primer video o prueba con uno de los ejemplos preconfigurados para generar clips con IA.
            </p>
          </div>
          <button
            onClick={onNewProject}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
          >
            Subir Video Ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const tags: string[] = proj.tags ? JSON.parse(proj.tags) : [];
            return (
              <div
                key={proj.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/70 hover:border-purple-500/40 transition-all duration-300 flex flex-col overflow-hidden group shadow-lg"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => onSelectProject(proj.id)}
                  className="relative aspect-video bg-zinc-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={
                      proj.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-purple-600/90 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      Ver Clips
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-zinc-300">
                      {Math.floor(proj.sourceDuration / 60)}:00 min
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3
                      onClick={() => onSelectProject(proj.id)}
                      className="text-sm font-bold text-white hover:text-purple-300 cursor-pointer line-clamp-2 transition-colors"
                    >
                      {proj.title}
                    </h3>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'Hoy'}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Listo</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir Proyecto</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
