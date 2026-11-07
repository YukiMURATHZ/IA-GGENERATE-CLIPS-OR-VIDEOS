import React, { useState } from 'react';
import {
  Film,
  Search,
  Flame,
  Play,
  Download,
  Share2,
  Edit3,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Clip } from '../types.ts';

interface LibraryViewProps {
  clips: Clip[];
  onOpenEditor: (clip: Clip) => void;
  onOpenDownload: (clip: Clip) => void;
  onOpenShare: (clip: Clip) => void;
  onGoToGenerate: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  clips,
  onOpenEditor,
  onOpenDownload,
  onOpenShare,
  onGoToGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | '95+' | '90+'>('all');

  const filtered = clips.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.projectTitle && c.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    if (scoreFilter === '95+') return matchesSearch && c.viralityScore >= 95;
    if (scoreFilter === '90+') return matchesSearch && c.viralityScore >= 90;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Biblioteca de Clips Virales</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {clips.length} clips generados y sincronizados con Cloud SQL PostgreSQL
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar clips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            {(['all', '90+', '95+'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setScoreFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  scoreFilter === lvl
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lvl === 'all' ? 'Todos' : `> ${lvl}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No hay clips que coincidan</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Prueba cambiando los filtros de búsqueda o genera nuevos clips a partir de un video largo.
            </p>
          </div>
          <button
            onClick={onGoToGenerate}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
          >
            Generar Nuevos Clips
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((clip) => (
            <div
              key={clip.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/70 hover:border-purple-500/40 transition-all duration-300 flex flex-col overflow-hidden group shadow-lg"
            >
              {/* Media Card Header */}
              <div
                onClick={() => onOpenEditor(clip)}
                className="relative aspect-video bg-zinc-900 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80"
                  alt={clip.title}
                  className="w-full h-full object-cover filter blur-[1px] opacity-50 group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{clip.viralityScore}/100</span>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-zinc-300">
                    {clip.duration.toFixed(0)}s • {clip.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  {clip.projectTitle && (
                    <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider line-clamp-1">
                      {clip.projectTitle}
                    </span>
                  )}
                  <h3
                    onClick={() => onOpenEditor(clip)}
                    className="text-sm font-extrabold text-white hover:text-purple-300 cursor-pointer line-clamp-2 transition-colors"
                  >
                    {clip.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    {clip.hookReason}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onOpenEditor(clip)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-purple-600/15 text-purple-300 hover:bg-purple-600/25 border border-purple-500/30 text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => onOpenDownload(clip)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bajar</span>
                  </button>

                  <button
                    onClick={() => onOpenShare(clip)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
