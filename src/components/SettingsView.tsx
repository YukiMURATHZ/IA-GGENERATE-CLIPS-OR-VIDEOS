import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  CheckCircle2,
  Sliders,
  Type,
  Smartphone,
  Sparkles,
  Save,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { UserSettings, SubtitleStyleType, AspectRatioType } from '../types.ts';
import { SUBTITLE_STYLES } from '../lib/constants.ts';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onShowToast,
}) => {
  const [autoFraming, setAutoFraming] = useState(settings.autoFraming ?? true);
  const [subtitlesStyle, setSubtitlesStyle] = useState<SubtitleStyleType>(
    settings.subtitlesStyle || 'bold_yellow'
  );
  const [preferredAspectRatio, setPreferredAspectRatio] = useState<AspectRatioType>(
    settings.preferredAspectRatio || '9:16'
  );
  const [exportResolution, setExportResolution] = useState(
    settings.exportResolution || '1080p'
  );
  const [aiModelPreset, setAiModelPreset] = useState(
    settings.aiModelPreset || 'viral_hooks'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setAutoFraming(settings.autoFraming ?? true);
    setSubtitlesStyle(settings.subtitlesStyle || 'bold_yellow');
    setPreferredAspectRatio(settings.preferredAspectRatio || '9:16');
    setExportResolution(settings.exportResolution || '1080p');
    setAiModelPreset(settings.aiModelPreset || 'viral_hooks');
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings({
        autoFraming,
        subtitlesStyle,
        preferredAspectRatio,
        exportResolution,
        aiModelPreset,
      });
      setSavedSuccess(true);
      onShowToast('¡Configuración guardada en Cloud SQL PostgreSQL!');
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
      onShowToast('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Configuración del Estudio IA
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Personaliza los valores predeterminados para la generación automática de clips.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-50"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Guardando...' : savedSuccess ? 'Guardado' : 'Guardar Ajustes'}</span>
        </button>
      </div>

      {/* Cloud SQL Database Info Card */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-purple">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Google Cloud SQL (PostgreSQL)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Conectado
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instancia Developer Edition con Drizzle ORM y agrupación de conexiones pg Pool.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-zinc-800">
          <span>Región: </span>
          <strong className="text-purple-300">us-east1</strong>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-6">
        {/* Subtitle Style Default */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Type className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Estilo de Subtítulos Karaoke por Defecto</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(SUBTITLE_STYLES) as SubtitleStyleType[]).map((key) => {
              const s = SUBTITLE_STYLES[key];
              const isSelected = subtitlesStyle === key;
              return (
                <div
                  key={key}
                  onClick={() => setSubtitlesStyle(key)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500 shadow-md shadow-purple-500/10'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{s.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio & Video Format Defaults */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Formato de Salida y Auto-Framing</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Framing 9:16 Inteligente</span>
                <span className="text-[11px] text-zinc-400">
                  Detección y seguimiento facial continuo para mantener al orador centrado.
                </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Relación de Aspecto Predilecta
                </label>
                <select
                  value={preferredAspectRatio}
                  onChange={(e) => setPreferredAspectRatio(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="9:16">9:16 Vertical (TikTok, Reels, Shorts)</option>
                  <option value="16:9">16:9 Horizontal (YouTube, Web)</option>
                  <option value="1:1">1:1 Cuadrado (Instagram Feed, LinkedIn)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Resolución de Renderizado
                </label>
                <select
                  value={exportResolution}
                  onChange={(e) => setExportResolution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="1080p">1080p Full HD (Recomendado)</option>
                  <option value="4k">4K Ultra HD (Máxima fidelidad)</option>
                  <option value="720p">720p HD (Exportación rápida)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* AI Virality Engine Tuning */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Modelo de Detección de Viralidad</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'viral_hooks',
                label: 'Ganchos Agresivos (Top)',
                desc: 'Prioriza momentos de alta energía y declaraciones polémicas',
              },
              {
                id: 'balanced',
                label: 'Equilibrado',
                desc: 'Combina valor informativo con ganchos de retención sostenida',
              },
              {
                id: 'educational',
                label: 'Educativo / Deep Dive',
                desc: 'Prioriza explicaciones claras, pasos y tutoriales',
              },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setAiModelPreset(m.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  aiModelPreset === m.id
                    ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <span className="text-xs font-bold text-white block mb-1">{m.label}</span>
                <p className="text-[10px] text-zinc-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
