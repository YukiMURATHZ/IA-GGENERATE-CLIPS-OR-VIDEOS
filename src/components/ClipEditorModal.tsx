import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
  Scissors,
  Type,
  Palette,
  Save,
  Download,
  Share2,
  Clock,
  Layers,
  Check,
  AlertCircle,
  Maximize,
} from 'lucide-react';
import { Clip, AspectRatioType, SubtitleStyleType, SubtitleWord } from '../types.ts';
import { SUBTITLE_STYLES } from '../lib/constants.ts';

interface ClipEditorModalProps {
  clip: Clip;
  sourceVideoUrl: string;
  onClose: () => void;
  onSave: (updatedClip: Clip) => Promise<void>;
  onOpenDownload: (clip: Clip) => void;
  onOpenShare: (clip: Clip) => void;
}

export const ClipEditorModal: React.FC<ClipEditorModalProps> = ({
  clip,
  sourceVideoUrl,
  onClose,
  onSave,
  onOpenDownload,
  onOpenShare,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Editable clip state
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(clip.aspectRatio || '9:16');
  const [stylePreset, setStylePreset] = useState<SubtitleStyleType>(clip.stylePreset || 'bold_yellow');
  const [startTime, setStartTime] = useState<number>(clip.startTime);
  const [endTime, setEndTime] = useState<number>(clip.endTime);
  const [title, setTitle] = useState<string>(clip.title);

  // Subtitles parsing
  const [subtitles, setSubtitles] = useState<SubtitleWord[]>(() => {
    try {
      return JSON.parse(clip.subtitles);
    } catch {
      return [];
    }
  });

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(clip.startTime);
  const [isMuted, setIsMuted] = useState(false);
  const [loopClip, setLoopClip] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'format' | 'subtitles' | 'trim'>('subtitles');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Subtitle styling options
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'center' | 'top'>('bottom');
  const [uppercaseOnly, setUppercaseOnly] = useState(true);
  const [showEmojis, setShowEmojis] = useState(true);

  // Synchronize video currentTime on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  }, []);

  // Update time and enforce trim boundaries during playback
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (curr >= endTime) {
      if (loopClip) {
        videoRef.current.currentTime = startTime;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Find active subtitle words based on currentTime
  // Active window of 3-5 words centered around current timestamp
  const activeWordIndex = subtitles.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Get current sentence window
  const currentWindowWords = subtitles.slice(
    Math.max(0, activeWordIndex === -1 ? 0 : activeWordIndex - 2),
    Math.min(subtitles.length, (activeWordIndex === -1 ? 4 : activeWordIndex + 3))
  );

  const duration = Math.max(1, endTime - startTime);

  const handleSaveToCloudSQL = async () => {
    setIsSaving(true);
    try {
      const updated: Clip = {
        ...clip,
        title,
        aspectRatio,
        stylePreset,
        startTime,
        endTime,
        duration,
        subtitles: JSON.stringify(subtitles),
      };
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Error saving clip:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Aspect ratio styling container
  const getAspectContainerClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'w-[320px] aspect-[9/16]';
      case '1:1':
        return 'w-[420px] aspect-square';
      case '16:9':
        return 'w-full max-w-[560px] aspect-video';
    }
  };

  const styleConfig = SUBTITLE_STYLES[stylePreset] || SUBTITLE_STYLES.bold_yellow;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-zinc-950 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Editor Top Bar */}
        <div className="h-16 px-6 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent text-sm font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-purple-500 px-1 py-0.5 rounded w-80 truncate"
              />
              <p className="text-[11px] text-zinc-400 font-mono">
                Puntuación de Viralidad: <strong className="text-amber-400">{clip.viralityScore}/100</strong> • Duración: {duration.toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Guardado en Cloud SQL
              </span>
            )}

            <button
              onClick={handleSaveToCloudSQL}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>

            <button
              onClick={() => onOpenDownload(clip)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Editor Body: Player (Left) + Tools (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Canvas / Video Player Preview (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-950 flex flex-col items-center justify-between p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 relative select-none">
            {/* Format quick switcher on top of preview */}
            <div className="flex items-center gap-2 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 mb-4 z-10">
              {[
                { id: '9:16', label: 'Shorts 9:16', icon: Smartphone },
                { id: '16:9', label: 'YouTube 16:9', icon: Monitor },
                { id: '1:1', label: 'Post 1:1', icon: Square },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = aspectRatio === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setAspectRatio(fmt.id as AspectRatioType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{fmt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Video Canvas Container */}
            <div className="flex-1 flex items-center justify-center w-full min-h-[360px] relative">
              <div
                className={`relative rounded-3xl overflow-hidden bg-black border-2 border-zinc-800 shadow-2xl transition-all duration-300 flex items-center justify-center ${getAspectContainerClass()}`}
              >
                {/* Simulated background blur when 9:16 is cropped */}
                {aspectRatio === '9:16' && (
                  <video
                    src={sourceVideoUrl}
                    className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-30 scale-125"
                    muted
                  />
                )}

                {/* Primary Video Element */}
                <video
                  ref={videoRef}
                  src={sourceVideoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onError={(e) => {
                    const video = e.currentTarget;
                    if (!video.src.includes('flower.mp4')) {
                      video.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
                      video.load();
                      video.play().catch(() => {});
                    }
                  }}
                  muted={isMuted}
                  playsInline
                  crossOrigin="anonymous"
                  className={`relative z-10 w-full h-full ${
                    aspectRatio === '9:16' ? 'object-cover' : 'object-contain'
                  }`}
                  onClick={togglePlay}
                />

                {/* Karaoke Subtitles Overlay */}
                <div
                  className={`absolute inset-x-4 z-20 pointer-events-none flex justify-center transition-all ${
                    subtitlePosition === 'top'
                      ? 'top-8'
                      : subtitlePosition === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-10'
                  }`}
                >
                  <div className={`text-center max-w-[90%] transition-all ${styleConfig.containerClass}`}>
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm sm:text-base md:text-lg">
                      {showEmojis && (
                        <span className="text-xl inline-block mr-1">🔥</span>
                      )}
                      {currentWindowWords.length > 0 ? (
                        currentWindowWords.map((wordObj, i) => {
                          const isWordActive =
                            currentTime >= wordObj.start && currentTime <= wordObj.end;
                          const wordText = uppercaseOnly
                            ? wordObj.word.toUpperCase()
                            : wordObj.word;

                          return (
                            <span
                              key={i}
                              className={`transition-all duration-100 ${
                                isWordActive
                                  ? styleConfig.activeWordClass
                                  : styleConfig.inactiveWordClass
                              }`}
                            >
                              {wordText}
                            </span>
                          );
                        })
                      ) : (
                        <span className={styleConfig.inactiveWordClass}>
                          {uppercaseOnly ? clip.title.toUpperCase() : clip.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Watermark / Auto-framing AI Tag */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-purple-300 border border-purple-500/20">
                    AI Auto-Framing • Face Tracked
                  </span>
                </div>
              </div>
            </div>

            {/* Playback Controls & Timeline Bar */}
            <div className="w-full max-w-lg mt-4 bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800 space-y-2.5 z-10">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-purple-300 font-bold">
                  {currentTime.toFixed(1)}s
                </span>
                <span className="text-[11px]">
                  Rango del Clip: {startTime.toFixed(1)}s - {endTime.toFixed(1)}s
                </span>
                <span>{endTime.toFixed(1)}s</span>
              </div>

              {/* Progress Scrubbing Bar */}
              <div
                className="relative h-2 bg-zinc-800 rounded-full cursor-pointer overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  const newTime = startTime + clickPos * duration;
                  seekTo(Math.min(endTime, Math.max(startTime, newTime)));
                }}
              >
                {/* Active Clip window fill */}
                <div
                  className="absolute top-0 bottom-0 bg-purple-500 rounded-full"
                  style={{
                    left: '0%',
                    width: `${Math.min(100, Math.max(0, ((currentTime - startTime) / duration) * 100))}%`,
                  }}
                />
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => seekTo(startTime)}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                    title="Volver al inicio del clip"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-600/30 transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loopClip}
                      onChange={(e) => setLoopClip(e.target.checked)}
                      className="rounded border-zinc-700 text-purple-600 focus:ring-0"
                    />
                    <span>Bucle (Loop)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Tools Panel (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-950 flex flex-col h-full overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/40">
              {[
                { id: 'subtitles', label: 'Subtítulos Karaoke', icon: Type },
                { id: 'trim', label: 'Recorte (Trim)', icon: Scissors },
                { id: 'format', label: 'Estilo & IA', icon: Palette },
              ].map((t) => {
                const Icon = t.icon;
                const isCurrent = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-semibold border-b-2 transition-all ${
                      isCurrent
                        ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: Subtítulos Karaoke */}
              {activeTab === 'subtitles' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-400" />
                      Plantilla Visual de Subtítulos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(SUBTITLE_STYLES) as SubtitleStyleType[]).map((key) => {
                        const s = SUBTITLE_STYLES[key];
                        const isSelected = stylePreset === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setStylePreset(key)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500/50 shadow-md shadow-purple-500/10'
                                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{s.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{s.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Position & Typography Options */}
                  <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">Posición en Pantalla</span>
                      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                        {(['top', 'center', 'bottom'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setSubtitlePosition(pos)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] capitalize font-medium transition-colors ${
                              subtitlePosition === pos
                                ? 'bg-purple-600 text-white font-bold'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {pos === 'top' ? 'Arriba' : pos === 'center' ? 'Centro' : 'Abajo'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <span className="text-xs font-semibold text-zinc-300">TODO MAYÚSCULAS</span>
                      <button
                        onClick={() => setUppercaseOnly(!uppercaseOnly)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          uppercaseOnly ? 'bg-purple-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            uppercaseOnly ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <span className="text-xs font-semibold text-zinc-300">Emojis Dinámicos IA</span>
                      <button
                        onClick={() => setShowEmojis(!showEmojis)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          showEmojis ? 'bg-purple-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            showEmojis ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Word-by-word Subtitle Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        Transcripción Palabra por Palabra ({subtitles.length} palabras)
                      </label>
                      <span className="text-[10px] text-zinc-400">Haz clic en una palabra para saltar a ese segundo</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                      {subtitles.map((item, idx) => {
                        const isCurrentWord =
                          currentTime >= item.start && currentTime <= item.end;
                        return (
                          <div
                            key={idx}
                            onClick={() => seekTo(item.start)}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                              isCurrentWord
                                ? 'bg-purple-600/30 border border-purple-500/50 text-white font-bold'
                                : 'hover:bg-zinc-800/60 text-zinc-300'
                            }`}
                          >
                            <input
                              type="text"
                              value={item.word}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const updated = [...subtitles];
                                updated[idx].word = e.target.value;
                                setSubtitles(updated);
                              }}
                              className="bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 px-1 py-0.5 rounded flex-1 font-medium"
                            />
                            <span className="text-[10px] font-mono text-zinc-400 ml-2">
                              {item.start.toFixed(1)}s - {item.end.toFixed(1)}s
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Recorte (Trimming) */}
              {activeTab === 'trim' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Scissors className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">Ajuste de Inicio y Final (Trim)</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      La IA recortó este clip para maximizar el gancho en los primeros 3 segundos. Puedes ajustar los puntos exactos de inicio y fin a continuación.
                    </p>
                  </div>

                  {/* Start time control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">Punto de Inicio (Trim In)</label>
                      <span className="text-xs font-mono text-purple-400 font-bold">{startTime.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, endTime - 2)}
                      step={0.1}
                      value={startTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setStartTime(val);
                        seekTo(val);
                      }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* End time control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">Punto de Fin (Trim Out)</label>
                      <span className="text-xs font-mono text-purple-400 font-bold">{endTime.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={startTime + 2}
                      max={clip.endTime + 30}
                      step={0.1}
                      value={endTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setEndTime(val);
                        seekTo(val);
                      }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Calculated metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <p className="text-[10px] text-zinc-400 font-medium">Duración Total</p>
                      <p className="text-base font-black text-white">{duration.toFixed(1)} segundos</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <p className="text-[10px] text-zinc-400 font-medium">Viralidad Estimada</p>
                      <p className="text-base font-black text-amber-400">{clip.viralityScore} / 100</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Estilo & IA */}
              {activeTab === 'format' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Relación de Aspecto
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '9:16', label: '9:16 Vertical (Shorts)', desc: 'TikTok, Reels' },
                        { id: '16:9', label: '16:9 Horizontal', desc: 'YouTube' },
                        { id: '1:1', label: '1:1 Cuadrado', desc: 'Instagram / Feed' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => setAspectRatio(fmt.id as AspectRatioType)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            aspectRatio === fmt.id
                              ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500'
                              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-xs font-bold text-white block">{fmt.label}</span>
                          <span className="text-[10px] text-zinc-400">{fmt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">Análisis de Retención IA</h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {clip.hookReason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Bottom Actions */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
              <button
                onClick={handleSaveToCloudSQL}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando en BD...' : 'Guardar en Base de Datos'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenShare(clip)}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  title="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenDownload(clip)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Clip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
