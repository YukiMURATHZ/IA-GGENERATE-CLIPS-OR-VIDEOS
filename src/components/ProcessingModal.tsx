import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Brain,
  Video,
  Subtitles,
  Activity,
  Flame,
} from 'lucide-react';
import { AI_PROCESSING_STAGES } from '../lib/constants.ts';

interface ProcessingModalProps {
  videoTitle: string;
  onComplete: () => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  videoTitle,
  onComplete,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viralityHooksFound, setViralityHooksFound] = useState(1);

  useEffect(() => {
    // Total duration around 6.5s
    const intervalTime = 60;
    const increment = 100 / (6500 / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }

        // Stage transitions based on progress
        if (next < 25) setCurrentStageIndex(0);
        else if (next < 55) {
          setCurrentStageIndex(1);
          setViralityHooksFound(3);
        } else if (next < 80) {
          setCurrentStageIndex(2);
          setViralityHooksFound(5);
        } else {
          setCurrentStageIndex(3);
          setViralityHooksFound(5);
        }

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const stages = [
    {
      title: 'Analizando transcripción...',
      icon: Brain,
      desc: 'Extrayendo pistas de voz y puntuando pausas fonéticas',
    },
    {
      title: 'Detectando momentos más virales...',
      icon: Flame,
      desc: 'Localizando picos de atención y ganchos de retención psicológica',
    },
    {
      title: 'Aplicando reencuadre inteligente (Auto-framing)...',
      icon: Video,
      desc: 'Ajustando orador al centro con relación vertical 9:16',
    },
    {
      title: 'Generando subtítulos automáticos...',
      icon: Subtitles,
      desc: 'Sincronizando palabras animadas estilo karaoke con resaltado',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-purple-500/40 p-8 shadow-2xl shadow-purple-600/20 overflow-hidden text-center glow-purple">
        {/* Glowing backdrop elements */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulse icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 mb-6 shadow-xl shadow-purple-600/30">
          <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
          Procesando Video con IA
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 truncate font-medium">
          "{videoTitle}"
        </p>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="text-purple-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              {stages[currentStageIndex]?.title}
            </span>
            <span className="text-white font-bold text-sm">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 transition-all duration-150 shadow-sm shadow-purple-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-3 text-left bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80 mb-6">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || progress >= 100;
            const isCurrent = idx === currentStageIndex && progress < 100;
            const Icon = stage.icon;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-purple-950/40 border border-purple-500/30'
                    : isCompleted
                    ? 'opacity-85'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-purple-300' : 'text-zinc-200'
                      }`}
                    >
                      {stage.title}
                    </p>
                    <p className="text-[10px] text-zinc-400">{stage.desc}</p>
                  </div>
                </div>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
            <p className="text-[10px] text-zinc-400 font-medium">Ganchos virales detectados</p>
            <p className="text-lg font-black text-amber-400">{viralityHooksFound} clips de alto impacto</p>
          </div>
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
            <p className="text-[10px] text-zinc-400 font-medium">Puntuación estimada</p>
            <p className="text-lg font-black text-purple-400">92 - 98 / 100</p>
          </div>
        </div>
      </div>
    </div>
  );
};
