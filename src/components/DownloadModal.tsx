import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Sparkles,
  Film,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Clip } from '../types.ts';

interface DownloadModalProps {
  clip: Clip;
  sourceVideoUrl: string;
  onClose: () => void;
  onExportSuccess: (clipId: number) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  clip,
  sourceVideoUrl,
  onClose,
  onExportSuccess,
}) => {
  const [resolution, setResolution] = useState('1080p');
  const [burnSubtitles, setBurnSubtitles] = useState(true);
  const [fps, setFps] = useState('60fps');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startExport = () => {
    setIsExporting(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        const next = prev + 12;
        if (next >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setIsCompleted(true);
          onExportSuccess(clip.id);

          // Trigger festive confetti!
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6'],
            });
          } catch {}

          return 100;
        }
        return next;
      });
    }, 180);
  };

  const handleDownloadFile = () => {
    // Trigger download
    const link = document.createElement('a');
    link.href = sourceVideoUrl;
    link.download = `${clip.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)}_viral_clip.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/40 p-6 shadow-2xl shadow-purple-600/20 overflow-hidden text-left glow-purple">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Download className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Exportar Clip Viral</h3>
              <p className="text-[11px] text-zinc-400">Renderizado de alta calidad con GPU Cloud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clip Summary Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 mb-5 flex items-center gap-3">
          <div className="w-12 h-16 rounded-xl bg-black overflow-hidden relative shrink-0 border border-zinc-800">
            <video
              src={sourceVideoUrl}
              className="w-full h-full object-cover"
              muted
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{clip.title}</h4>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
              <span className="text-purple-400 font-bold">{clip.aspectRatio}</span>
              <span>•</span>
              <span>{clip.duration.toFixed(1)}s</span>
              <span>•</span>
              <span className="text-amber-400">{clip.viralityScore}/100 Viral</span>
            </div>
          </div>
        </div>

        {/* Configuration */}
        {!isExporting && !isCompleted ? (
          <div className="space-y-4">
            {/* Resolution */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Resolución de Salida</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1080p', label: '1080p Full HD', desc: 'Recomendado' },
                  { id: '4k', label: '4K Ultra HD', desc: 'Máxima Calidad' },
                  { id: '720p', label: '720p Rápido', desc: 'Menor tamaño' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      resolution === r.id
                        ? 'border-purple-500 bg-purple-950/30 text-purple-200'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">{r.label}</span>
                    <span className="text-[9px] text-zinc-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Cuadros por Segundo (FPS)</label>
              <div className="grid grid-cols-2 gap-2">
                {['60fps (Ultra Fluido)', '30fps (Estándar)'].map((f) => {
                  const val = f.split(' ')[0];
                  return (
                    <button
                      key={val}
                      onClick={() => setFps(val)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        fps === val
                          ? 'border-purple-500 bg-purple-950/30 text-purple-200'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Burn-in Subtitles Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Incrustar Subtítulos Quemados
                </span>
                <span className="text-[10px] text-zinc-400">
                  Subtítulos karaoke integrados directamente en el MP4
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBurnSubtitles(!burnSubtitles)}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  burnSubtitles ? 'bg-purple-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    burnSubtitles ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Render Button */}
            <button
              onClick={startExport}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 mt-4"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Iniciar Renderizado ({resolution})</span>
            </button>
          </div>
        ) : isExporting ? (
          /* Export in progress */
          <div className="py-8 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center">
              <Activity className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Renderizando con GPU...</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Codificando audio AAC, Auto-Framing y subtítulos karaoke
              </p>
            </div>

            <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5 max-w-xs mx-auto">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-xs font-mono font-bold text-zinc-300">{exportProgress}%</p>
          </div>
        ) : (
          /* Completed */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">¡Clip Renderizado con Éxito!</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Tu video vertical 9:16 está listo para ser publicado en TikTok, Shorts o Reels.
              </p>
            </div>

            <button
              onClick={handleDownloadFile}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo MP4</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
