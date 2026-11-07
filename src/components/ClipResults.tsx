import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Play,
  Download,
  Share2,
  Edit3,
  Sliders,
  Check,
  Clock,
  TrendingUp,
  Maximize2,
  Film,
  Zap,
} from 'lucide-react';
import { Clip, Project } from '../types.ts';

interface ClipResultsProps {
  project: Project;
  clips: Clip[];
  onOpenEditor: (clip: Clip) => void;
  onOpenDownload: (clip: Clip) => void;
  onOpenShare: (clip: Clip) => void;
  onBackToUpload: () => void;
}

export const ClipResults: React.FC<ClipResultsProps> = ({
  project,
  clips,
  onOpenEditor,
  onOpenDownload,
  onOpenShare,
  onBackToUpload,
}) => {
  const [filter, setFilter] = useState<'all' | 'high_score' | 'short'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Sorting and filtering
  const filteredClips = [...clips].filter((c) => {
    if (filter === 'high_score') return c.viralityScore >= 90;
    if (filter === 'short') return c.duration <= 45;
    return true;
  }).sort((a, b) => b.viralityScore - a.viralityScore);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'from-amber-400 to-orange-500 text-amber-300 border-amber-500/40 bg-amber-950/30';
    if (score >= 90) return 'from-purple-400 to-pink-500 text-purple-300 border-purple-500/40 bg-purple-950/30';
    return 'from-cyan-400 to-blue-500 text-cyan-300 border-cyan-500/40 bg-cyan-950/30';
  };

  const handleCopyTitle = (clip: Clip) => {
    navigator.clipboard.writeText(clip.title);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Procesamiento Completado
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Cloud SQL ID: #{project.id}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {project.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Se generaron <strong className="text-purple-300">{clips.length} clips inteligentes</strong> optimizados con Auto-Framing 9:16 y subtítulos karaoke.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToUpload}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-semibold transition-all"
          >
            Subir Otro Video
          </button>
        </div>
      </div>

      {/* Filter and Metrics Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 px-2">Filtrar:</span>
          {[
            { id: 'all', label: `Todos (${clips.length})` },
            { id: 'high_score', label: 'Score > 90' },
            { id: 'short', label: '< 45s' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === tab.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 px-2">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Top Virality: <strong className="text-amber-300">{Math.max(...clips.map(c => c.viralityScore))}/100</strong>
          </span>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Total: ~{Math.round(clips.reduce((acc, c) => acc + c.duration, 0))}s de contenido
          </span>
        </div>
      </div>

      {/* Clips Grid (4-6 clips) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClips.map((clip) => {
          const scoreStyle = getScoreColor(clip.viralityScore);
          return (
            <div
              key={clip.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/70 hover:border-purple-500/50 transition-all duration-300 flex flex-col overflow-hidden group shadow-lg hover:shadow-2xl hover:shadow-purple-600/10"
            >
              {/* Card Media Preview */}
              <div
                onClick={() => onOpenEditor(clip)}
                className="relative aspect-[9/12] bg-zinc-900 cursor-pointer overflow-hidden group/media flex items-center justify-center"
              >
                {/* Background blurred frame or thumbnail */}
                <img
                  src={
                    project.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={clip.title}
                  className="w-full h-full object-cover filter blur-[2px] opacity-40 group-hover/media:scale-105 transition-transform duration-500"
                />

                {/* Vertical 9:16 Mock framing inside preview */}
                <div className="absolute inset-y-2 inset-x-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <img
                    src={
                      project.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={clip.title}
                    className="w-full h-full object-cover opacity-85 group-hover/media:scale-105 transition-transform duration-500"
                  />
                  {/* Karaoke subtitle preview snippet */}
                  <div className="absolute bottom-4 inset-x-2 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-xl bg-black/85 text-[11px] font-black uppercase text-amber-300 border border-white/10 shadow-lg tracking-tight">
                      🔥 {clip.title.replace(/^[^\w\s]+/, '').slice(0, 24)}...
                    </span>
                  </div>
                </div>

                {/* Floating Play Button */}
                <div className="absolute inset-0 bg-black/30 group-hover/media:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 group-hover/media:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Virality Score Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border backdrop-blur-md shadow-lg font-black text-xs ${scoreStyle}`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{clip.viralityScore}/100</span>
                    <span className="text-[10px] font-medium opacity-80">VIRAL</span>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-zinc-200 border border-white/10">
                    {Math.round(clip.duration)}s • 9:16
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-white leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {clip.title}
                    </h3>
                  </div>

                  {/* Hook Reason */}
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      💡 Gancho de Retención IA
                    </span>
                    <p className="line-clamp-2 leading-relaxed text-zinc-400">
                      {clip.hookReason}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {clip.startTime.toFixed(1)}s - {clip.endTime.toFixed(1)}s
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400">Subtítulos Karaoke</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-2">
                  {/* Editar Subtítulos */}
                  <button
                    id="btn-edit-clip"
                    onClick={() => onOpenEditor(clip)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                    title="Editar subtítulos y recorte"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* Descargar */}
                  <button
                    onClick={() => onOpenDownload(clip)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all"
                    title="Descargar clip en MP4 1080p"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bajar</span>
                  </button>

                  {/* Compartir */}
                  <button
                    onClick={() => onOpenShare(clip)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all"
                    title="Compartir en TikTok, Shorts o Reels"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
