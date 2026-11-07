import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Link as LinkIcon,
  Sparkles,
  Play,
  Check,
  Sliders,
  ChevronRight,
  Flame,
  Layers,
  Wand2,
  FileVideo,
  Lightbulb,
  Youtube,
  Globe,
  MessageSquareQuote,
  X,
} from 'lucide-react';
import { SAMPLE_VIDEOS, SUBTITLE_STYLES } from '../lib/constants.ts';
import { SampleVideo, SubtitleStyleType } from '../types.ts';

export type GenerationMode = 'url' | 'file' | 'prompt';

interface UploaderProps {
  onStartProcessing: (config: {
    mode: GenerationMode;
    videoUrl: string;
    videoTitle: string;
    duration: number;
    thumbnailUrl?: string;
    stylePreset: SubtitleStyleType;
    clipLength: 'auto' | '30-60s' | 'under-30s';
    autoFraming: boolean;
    sampleData?: SampleVideo;
    promptText?: string;
  }) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onStartProcessing }) => {
  // Input mode: URL, File upload, or AI Prompt
  const [activeMode, setActiveMode] = useState<GenerationMode>('url');

  // Mode 1: URL state
  const [videoUrlInput, setVideoUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [urlPlatform, setUrlPlatform] = useState<string>('YouTube');

  // Mode 2: File state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Mode 3: Prompt state
  const [promptText, setPromptText] = useState(
    'Crea un clip viral sobre los 3 hábitos que diferencian al 1% de los millonarios de la clase media con un gancho polémico en los primeros 2 segundos'
  );
  const [promptTone, setPromptTone] = useState<'aggressive' | 'educational' | 'story'>('aggressive');

  // Common metadata
  const [customTitle, setCustomTitle] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleVideo | null>(SAMPLE_VIDEOS[0]);

  // AI Parameters
  const [stylePreset, setStylePreset] = useState<SubtitleStyleType>('bold_yellow');
  const [clipLength, setClipLength] = useState<'auto' | '30-60s' | 'under-30s'>('30-60s');
  const [autoFraming, setAutoFraming] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PROMPT_SUGGESTIONS = [
    '🔥 3 hábitos que diferencian al 1% de los millonarios de la clase media',
    '💡 Cómo crear una agencia de IA sin programar en 2026',
    '🧠 El truco psicológico del bucle infinito para retener 100% en TikTok',
    '📈 El error de fijación de precios que casi quiebra nuestra startup',
  ];

  const URL_SUGGESTIONS = [
    { label: 'YouTube Podcast', url: 'https://youtube.com/watch?v=sample-ai-podcast' },
    { label: 'TikTok Trending', url: 'https://tiktok.com/@creator/video/sample-growth-hack' },
    { label: 'Directo MP4', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setSelectedSample(null);
    setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    const url = URL.createObjectURL(file);
    setFilePreviewUrl(url);
  };

  const selectSampleVideo = (sample: SampleVideo) => {
    setSelectedSample(sample);
    setSelectedFile(null);
    setCustomTitle(sample.title);
    if (activeMode === 'url') {
      setVideoUrlInput(sample.videoUrl);
    }
  };

  const handleSubmit = () => {
    if (activeMode === 'prompt') {
      onStartProcessing({
        mode: 'prompt',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        videoTitle: customTitle || promptText.slice(0, 45) + '...',
        duration: 120,
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        stylePreset,
        clipLength,
        autoFraming,
        promptText,
      });
      return;
    }

    if (activeMode === 'url') {
      onStartProcessing({
        mode: 'url',
        videoUrl: videoUrlInput.trim() || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        videoTitle: customTitle || (selectedSample ? selectedSample.title : 'Video desde Enlace Web'),
        duration: selectedSample ? selectedSample.duration : 180,
        thumbnailUrl: selectedSample?.thumbnailUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
        stylePreset,
        clipLength,
        autoFraming,
        sampleData: selectedSample || undefined,
      });
      return;
    }

    if (activeMode === 'file') {
      if (selectedFile && filePreviewUrl) {
        onStartProcessing({
          mode: 'file',
          videoUrl: filePreviewUrl,
          videoTitle: customTitle || selectedFile.name,
          duration: 150,
          thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
          stylePreset,
          clipLength,
          autoFraming,
        });
      } else if (selectedSample) {
        onStartProcessing({
          mode: 'file',
          videoUrl: selectedSample.videoUrl,
          videoTitle: customTitle || selectedSample.title,
          duration: selectedSample.duration,
          thumbnailUrl: selectedSample.thumbnailUrl,
          stylePreset,
          clipLength,
          autoFraming,
          sampleData: selectedSample,
        });
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-purple-500/30 bg-gradient-to-r from-zinc-950 via-purple-950/20 to-zinc-950 glow-purple">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generador Multimodal v3.8 Activo</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Genera clips virales mediante <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">URL, Archivo o Prompt</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Elige cómo crear tu contenido: pega un enlace de YouTube/TikTok, sube tu propio archivo de video, o escribe una idea/prompt para que la IA genere el video completo.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
            <div className="text-center px-2">
              <p className="text-2xl font-black text-purple-400">3 Vías</p>
              <p className="text-[11px] text-zinc-400 font-medium">De Generación</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center px-2">
              <p className="text-2xl font-black text-amber-400">9:16</p>
              <p className="text-[11px] text-zinc-400 font-medium">Auto-Framing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Creation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 3 Input Modes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Tabs Header */}
          <div className="p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveMode('url')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'url'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Pegar URL</span>
            </button>

            <button
              onClick={() => setActiveMode('file')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'file'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir Archivo</span>
            </button>

            <button
              onClick={() => setActiveMode('prompt')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                activeMode === 'prompt'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Crear con Prompt</span>
            </button>
          </div>

          {/* MODE 1: URL Input Form */}
          {activeMode === 'url' && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Introduce la URL del Video</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Soporta enlaces de YouTube, Shorts, TikTok, Loom, Vimeo o URLs directas (.mp4 / .webm)
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                  />
                  {videoUrlInput && (
                    <button
                      onClick={() => setVideoUrlInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick URL chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-zinc-400">Ejemplos rápidos:</span>
                  {URL_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVideoUrlInput(s.url);
                        if (idx === 0 && SAMPLE_VIDEOS[0]) selectSampleVideo(SAMPLE_VIDEOS[0]);
                        if (idx === 1 && SAMPLE_VIDEOS[1]) selectSampleVideo(SAMPLE_VIDEOS[1]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 text-[11px] text-zinc-300 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Preview Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Youtube className="w-6 h-6 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    Metadatos detectados
                  </span>
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {customTitle || 'Video de análisis viral'}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    Extracción de audio Whisper AI + detección de ganchos en los primeros 3 segundos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: File Upload (Drag & Drop) */}
          {activeMode === 'file' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[260px] group ${
                dragActive
                  ? 'border-purple-500 bg-purple-950/20 shadow-2xl shadow-purple-500/20 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-zinc-800 hover:border-purple-500/60 bg-zinc-900/40 hover:bg-zinc-900/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
                className="hidden"
                onChange={handleFileInput}
              />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-purple-400" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                {selectedFile ? selectedFile.name : 'Arrastra y suelta tu video aquí'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-4">
                Soporta archivos MP4, MOV, MKV o WebM de podcasts, entrevistas, conferencias o videos educativos.
              </p>

              <span className="px-4 py-2 rounded-xl bg-zinc-800/80 group-hover:bg-purple-600/20 text-zinc-300 group-hover:text-purple-300 border border-zinc-700/60 group-hover:border-purple-500/40 text-xs font-semibold transition-all">
                Examinar archivos locales
              </span>
            </div>
          )}

          {/* MODE 3: Prompt to Video */}
          {activeMode === 'prompt' && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Escribe tu Prompt o Idea de Video</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  El motor Gemini generará el guión, los ganchos de retención, los subtítulos karaoke y los clips sincronizados automáticamente.
                </p>
              </div>

              {/* Prompt Textarea */}
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ej: Crea un video corto sobre cómo negociar tu sueldo con técnicas del FBI..."
                  className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                />

                {/* Prompt Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Ideas recomendadas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptText(s)}
                        className="text-left px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/60 text-xs text-zinc-300 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sample Videos Section (1-Click Test) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                O prueba con un video de ejemplo preconfigurado
              </span>
              <span className="text-[11px] text-zinc-400">1-click demo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_VIDEOS.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => selectSampleVideo(sample)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/30 shadow-md shadow-purple-500/20 ring-1 ring-purple-500'
                        : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
                      <img
                        src={sample.thumbnailUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white/80" />
                      </div>
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 px-1 rounded text-zinc-200">
                        {Math.floor(sample.duration / 60)}:00
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-purple-400">
                          {sample.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                          Top Viral
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 truncate">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {sample.demoClips.length} clips detectados por IA
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Processing Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Parámetros de la Inteligencia Artificial</h3>
            </div>

            {/* Video Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Título del Proyecto
              </label>
              <input
                type="text"
                value={customTitle || (activeMode === 'prompt' ? promptText.slice(0, 35) : selectedSample?.title || '')}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Nombre del video..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Clip Target Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Duración Deseada de los Clips
                </label>
                <span className="text-[11px] text-purple-400 font-mono">
                  {clipLength === '30-60s' ? '30 a 60 segundos' : clipLength}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '30-60s', label: '30-60s (Ideal)' },
                  { id: 'under-30s', label: '< 30s (Ultra)' },
                  { id: 'auto', label: 'Auto IA' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setClipLength(opt.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                      clipLength === opt.id
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 font-bold'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Style Preset */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Estilo de Subtítulos Karaoke
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SUBTITLE_STYLES) as SubtitleStyleType[]).map((key) => {
                  const s = SUBTITLE_STYLES[key];
                  const isSelected = stylePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStylePreset(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-200">{s.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto Framing Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Auto-Framing 9:16 Inteligente
                </span>
                <p className="text-[10px] text-zinc-400">
                  Rastrea caras y centra al orador para formato vertical
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoFraming(!autoFraming)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  autoFraming ? 'bg-purple-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoFraming ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* CTA Button */}
            <button
              id="btn-generate-clips"
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>
                {activeMode === 'prompt'
                  ? 'Generar Video y Clips con Prompt'
                  : activeMode === 'url'
                  ? 'Analizar URL y Generar Clips'
                  : 'Procesar Archivo y Generar Clips'}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
