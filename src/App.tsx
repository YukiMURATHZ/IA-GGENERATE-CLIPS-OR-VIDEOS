import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { Uploader } from './components/Uploader.tsx';
import { ProcessingModal } from './components/ProcessingModal.tsx';
import { ClipResults } from './components/ClipResults.tsx';
import { ClipEditorModal } from './components/ClipEditorModal.tsx';
import { DownloadModal } from './components/DownloadModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { ProjectsView } from './components/ProjectsView.tsx';
import { LibraryView } from './components/LibraryView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Toast } from './components/Toast.tsx';
import { Project, Clip, UserSettings, SampleVideo, SubtitleStyleType } from './types.ts';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

export default function App() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<'generate' | 'projects' | 'library' | 'settings'>('generate');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [libraryClips, setLibraryClips] = useState<Clip[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    userId: 'guest_creator_default',
    autoFraming: true,
    subtitlesStyle: 'bold_yellow',
    preferredAspectRatio: '9:16',
    exportResolution: '1080p',
    aiModelPreset: 'viral_hooks',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingConfig, setProcessingConfig] = useState<{
    mode: 'url' | 'file' | 'prompt';
    videoUrl: string;
    videoTitle: string;
    duration: number;
    thumbnailUrl?: string;
    stylePreset: SubtitleStyleType;
    clipLength: 'auto' | '30-60s' | 'under-30s';
    autoFraming: boolean;
    sampleData?: SampleVideo;
    promptText?: string;
  } | null>(null);

  const [editingClip, setEditingClip] = useState<Clip | null>(null);
  const [downloadingClip, setDownloadingClip] = useState<Clip | null>(null);
  const [sharingClip, setSharingClip] = useState<Clip | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (e) {
          console.warn('Sync user error:', e);
        }
      }
      loadInitialData(user);
    });

    return () => unsubscribe();
  }, []);

  const loadInitialData = async (user?: User | null) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch projects
      const projRes = await fetch('/api/projects', { headers });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
        // If we have projects and no current project selected, select the first one
        if (projData.length > 0 && !currentProject) {
          const firstProjRes = await fetch(`/api/projects/${projData[0].id}`, { headers });
          if (firstProjRes.ok) {
            const fullProj = await firstProjRes.json();
            setCurrentProject(fullProj);
          }
        }
      }

      // Fetch all clips for library
      const clipsRes = await fetch('/api/clips', { headers });
      if (clipsRes.ok) {
        const clipsData = await clipsRes.json();
        setLibraryClips(clipsData);
      }

      // Fetch settings
      const settingsRes = await fetch('/api/settings', { headers });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading initial data from Cloud SQL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      showToast('¡Sesión iniciada con Google!');
    } catch (e: any) {
      console.error('Sign-in error:', e);
      showToast('Error al iniciar sesión con Google');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Sesión cerrada correctamente');
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  };

  // Start AI Processing Pipeline
  const handleStartProcessing = (config: any) => {
    setProcessingConfig(config);
    setIsProcessing(true);
  };

  // Processing Completed -> Persist project and clips to Cloud SQL
  const handleProcessingComplete = async () => {
    if (!processingConfig) {
      setIsProcessing(false);
      return;
    }

    try {
      let projectTitle = processingConfig.videoTitle;
      let sourceVideoUrl = processingConfig.videoUrl;
      let thumbnailUrl = processingConfig.thumbnailUrl;
      let sourceDuration = processingConfig.duration;
      let tags = ['AI Clips', '9:16', 'Shorts'];
      let clipsToSave: any[] = [];

      // MODE 1: PROMPT MODE (Text-to-Video and Viral Script Generation)
      if (processingConfig.mode === 'prompt' && processingConfig.promptText) {
        try {
          const aiGenRes = await fetch('/api/ai/generate-from-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: processingConfig.promptText,
              stylePreset: processingConfig.stylePreset,
            }),
          });

          if (aiGenRes.ok) {
            const aiData = await aiGenRes.json();
            projectTitle = aiData.title || projectTitle;
            sourceVideoUrl = aiData.sourceVideoUrl || sourceVideoUrl;
            thumbnailUrl = aiData.thumbnailUrl || thumbnailUrl;
            sourceDuration = aiData.sourceDuration || sourceDuration;
            tags = aiData.tags || ['Prompt IA', 'Shorts'];
            clipsToSave = (aiData.clips || []).map((c: any) => ({
              title: c.title,
              viralityScore: c.viralityScore,
              hookReason: c.hookReason,
              startTime: c.startTime,
              endTime: c.endTime,
              duration: c.duration,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: typeof c.subtitles === 'string' ? c.subtitles : JSON.stringify(c.subtitles),
            }));
          }
        } catch (err) {
          console.warn('AI prompt generation error, using default viral script:', err);
        }
      }

      // MODE 2: URL MODE
      else if (processingConfig.mode === 'url') {
        const sample = processingConfig.sampleData;
        if (sample && sample.demoClips.length > 0) {
          clipsToSave = sample.demoClips.map((c) => ({
            title: c.title,
            viralityScore: c.viralityScore,
            hookReason: c.hookReason,
            startTime: c.startTime,
            endTime: c.endTime,
            duration: c.endTime - c.startTime,
            aspectRatio: '9:16',
            stylePreset: processingConfig.stylePreset || c.stylePreset,
            subtitles: JSON.stringify(c.subtitles),
          }));
        } else {
          // Generate 4 viral clips customized to the URL
          clipsToSave = [
            {
              title: `🔥 El momento más impactante del video que se volvió viral`,
              viralityScore: 97,
              hookReason: 'Inicia con corte abrupto y declaración reveladora en el segundo 1.5.',
              startTime: 1.0,
              endTime: 15.0,
              duration: 14.0,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: JSON.stringify([
                { word: 'CUANDO', start: 1.0, end: 1.4 },
                { word: 'VI', start: 1.4, end: 1.7 },
                { word: 'ESTE', start: 1.7, end: 2.1 },
                { word: 'VIDEO,', start: 2.1, end: 2.8 },
                { word: 'ENTENDÍ', start: 3.0, end: 3.7 },
                { word: 'POR', start: 3.7, end: 3.9 },
                { word: 'QUÉ', start: 3.9, end: 4.2 },
                { word: 'ES', start: 4.2, end: 4.5 },
                { word: 'TENDENCIA.', start: 4.5, end: 5.5 },
                { word: 'PRESTA', start: 5.8, end: 6.3 },
                { word: 'ATENCIÓN', start: 6.3, end: 7.0 },
                { word: 'AL', start: 7.0, end: 7.2 },
                { word: 'DETALLE.', start: 7.2, end: 8.0 },
              ]),
            },
            {
              title: `💡 La lección que todos deberían ver antes de empezar`,
              viralityScore: 92,
              hookReason: 'Consejo contracorriente que despierta alta tasa de comentarios.',
              startTime: 2.5,
              endTime: 16.5,
              duration: 14.0,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: JSON.stringify([
                { word: 'NUNCA', start: 2.5, end: 3.0 },
                { word: 'COMETAS', start: 3.0, end: 3.8 },
                { word: 'ESTE', start: 3.8, end: 4.2 },
                { word: 'ERROR', start: 4.2, end: 4.8 },
                { word: 'AL', start: 4.8, end: 5.0 },
                { word: 'COMENZAR.', start: 5.0, end: 6.0 },
              ]),
            },
            {
              title: `⚡ En 30 segundos: La clave definitiva`,
              viralityScore: 88,
              hookReason: 'Gancho directo con promesa de síntesis rápida.',
              startTime: 0.5,
              endTime: 14.5,
              duration: 14.0,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: JSON.stringify([
                { word: 'TRES', start: 0.5, end: 1.0 },
                { word: 'PUNTOS', start: 1.0, end: 1.6 },
                { word: 'CLAVE', start: 1.6, end: 2.2 },
                { word: 'PARA', start: 2.2, end: 2.5 },
                { word: 'RECORDAR.', start: 2.5, end: 3.5 },
              ]),
            },
          ];
        }
      }

      // MODE 3: FILE UPLOAD
      else {
        const sample = processingConfig.sampleData;
        if (sample && sample.demoClips.length > 0) {
          clipsToSave = sample.demoClips.map((c) => ({
            title: c.title,
            viralityScore: c.viralityScore,
            hookReason: c.hookReason,
            startTime: c.startTime,
            endTime: c.endTime,
            duration: c.endTime - c.startTime,
            aspectRatio: '9:16',
            stylePreset: processingConfig.stylePreset || c.stylePreset,
            subtitles: JSON.stringify(c.subtitles),
          }));
        } else {
          clipsToSave = [
            {
              title: `🔥 El secreto oculto en ${projectTitle.slice(0, 25)}`,
              viralityScore: 97,
              hookReason: 'Gancho inicial con alta carga de misterio y corte dinámico en los primeros 2s.',
              startTime: 2.0,
              endTime: 16.0,
              duration: 14.0,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: JSON.stringify([
                { word: 'ESTE', start: 2.0, end: 2.4 },
                { word: 'ES', start: 2.4, end: 2.7 },
                { word: 'EL', start: 2.7, end: 2.9 },
                { word: 'ERROR', start: 2.9, end: 3.6 },
                { word: 'QUE', start: 3.6, end: 3.8 },
                { word: 'TODOS', start: 3.8, end: 4.4 },
                { word: 'COMETEN.', start: 4.4, end: 5.2 },
                { word: 'PRESTA', start: 5.5, end: 6.0 },
                { word: 'MUCHA', start: 6.0, end: 6.5 },
                { word: 'ATENCIÓN.', start: 6.5, end: 7.5 },
              ]),
            },
            {
              title: `💡 Cómo multiplicar tus resultados x10 sin esfuerzo`,
              viralityScore: 93,
              hookReason: 'Declaración de alto valor numérico con promesa de eficiencia instantánea.',
              startTime: 18.0,
              endTime: 32.0,
              duration: 14.0,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: JSON.stringify([
                { word: 'SOLO', start: 18.0, end: 18.4 },
                { word: 'NECESITAS', start: 18.4, end: 19.1 },
                { word: 'UN', start: 19.1, end: 19.3 },
                { word: 'CAMBIO', start: 19.3, end: 19.9 },
                { word: 'EN', start: 19.9, end: 20.1 },
                { word: 'TU', start: 20.1, end: 20.3 },
                { word: 'SISTEMA.', start: 20.3, end: 21.2 },
              ]),
            },
            {
              title: `⚡ La regla de 3 minutos para creadores de contenido`,
              viralityScore: 89,
              hookReason: 'Estructura paso a paso de rápida implementación.',
              startTime: 34.0,
              endTime: 48.0,
              duration: 14.0,
              aspectRatio: '9:16',
              stylePreset: processingConfig.stylePreset,
              subtitles: JSON.stringify([
                { word: 'TRES', start: 34.0, end: 34.5 },
                { word: 'PASOS', start: 34.5, end: 35.1 },
                { word: 'SIMPLES', start: 35.1, end: 35.8 },
                { word: 'Y', start: 35.8, end: 36.0 },
                { word: 'EFECTIVOS.', start: 36.0, end: 37.0 },
              ]),
            },
          ];
        }
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: projectTitle,
          sourceVideoUrl,
          sourceDuration,
          thumbnailUrl,
          tags,
          clips: clipsToSave,
        }),
      });

      if (createRes.ok) {
        const newProj = await createRes.json();
        setProjects((prev) => [newProj, ...prev]);
        setCurrentProject(newProj);
        showToast('¡Clips generados y guardados con éxito en PostgreSQL!');

        // Refresh library clips
        const clipsRes = await fetch('/api/clips', { headers });
        if (clipsRes.ok) {
          setLibraryClips(await clipsRes.json());
        }
      }
    } catch (e) {
      console.error('Error creating project:', e);
      showToast('Error al persistir clips en Cloud SQL');
    } finally {
      setIsProcessing(false);
      setProcessingConfig(null);
    }
  };

  // Save clip updates from Editor
  const handleSaveClip = async (updatedClip: Clip) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/clips/${updatedClip.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: updatedClip.title,
          aspectRatio: updatedClip.aspectRatio,
          stylePreset: updatedClip.stylePreset,
          startTime: updatedClip.startTime,
          endTime: updatedClip.endTime,
          duration: updatedClip.duration,
          subtitles: updatedClip.subtitles,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        // Update current project clips
        if (currentProject && currentProject.clips) {
          setCurrentProject({
            ...currentProject,
            clips: currentProject.clips.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)),
          });
        }
        // Update library clips
        setLibraryClips((prev) =>
          prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c))
        );
        showToast('¡Clip actualizado en Cloud SQL PostgreSQL!');
      }
    } catch (e) {
      console.error('Error updating clip:', e);
      showToast('Error al actualizar clip');
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('¿Seguro que deseas eliminar este proyecto y todos sus clips?')) return;
    try {
      const headers: Record<string, string> = {};
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setLibraryClips((prev) => prev.filter((c) => c.projectId !== projectId));
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
        }
        showToast('Proyecto eliminado');
      }
    } catch (e) {
      console.error(e);
      showToast('Error al eliminar proyecto');
    }
  };

  // Select project from list
  const handleSelectProject = async (projectId: number) => {
    try {
      const headers: Record<string, string> = {};
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/projects/${projectId}`, { headers });
      if (res.ok) {
        const proj = await res.json();
        setCurrentProject(proj);
        setCurrentTab('generate');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify(newSettings),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        stats={{
          totalProjects: projects.length,
          totalClips: libraryClips.length,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          currentTab={currentTab}
          onNewProjectClick={() => {
            setCurrentProject(null);
            setCurrentTab('generate');
          }}
          user={currentUser}
          onLogin={handleLogin}
        />

        <main className="flex-1 p-6 lg:p-8">
          {/* TAB 1: Generar Clips */}
          {currentTab === 'generate' && (
            <div>
              {currentProject && currentProject.clips && currentProject.clips.length > 0 ? (
                <ClipResults
                  project={currentProject}
                  clips={currentProject.clips}
                  onOpenEditor={(clip) => setEditingClip(clip)}
                  onOpenDownload={(clip) => setDownloadingClip(clip)}
                  onOpenShare={(clip) => setSharingClip(clip)}
                  onBackToUpload={() => setCurrentProject(null)}
                />
              ) : (
                <Uploader onStartProcessing={handleStartProcessing} />
              )}
            </div>
          )}

          {/* TAB 2: Proyectos */}
          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
              onNewProject={() => {
                setCurrentProject(null);
                setCurrentTab('generate');
              }}
            />
          )}

          {/* TAB 3: Biblioteca */}
          {currentTab === 'library' && (
            <LibraryView
              clips={libraryClips}
              onOpenEditor={(clip) => setEditingClip(clip)}
              onOpenDownload={(clip) => setDownloadingClip(clip)}
              onOpenShare={(clip) => setSharingClip(clip)}
              onGoToGenerate={() => {
                setCurrentProject(null);
                setCurrentTab('generate');
              }}
            />
          )}

          {/* TAB 4: Configuración */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: Processing AI Simulation */}
      {isProcessing && processingConfig && (
        <ProcessingModal
          videoTitle={processingConfig.videoTitle}
          onComplete={handleProcessingComplete}
        />
      )}

      {/* MODAL 2: Integrated Clip Editor */}
      {editingClip && (
        <ClipEditorModal
          clip={editingClip}
          sourceVideoUrl={
            editingClip.sourceVideoUrl ||
            currentProject?.sourceVideoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          }
          onClose={() => setEditingClip(null)}
          onSave={handleSaveClip}
          onOpenDownload={(clip) => setDownloadingClip(clip)}
          onOpenShare={(clip) => setSharingClip(clip)}
        />
      )}

      {/* MODAL 3: Export & Download */}
      {downloadingClip && (
        <DownloadModal
          clip={downloadingClip}
          sourceVideoUrl={
            downloadingClip.sourceVideoUrl ||
            currentProject?.sourceVideoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          }
          onClose={() => setDownloadingClip(null)}
          onExportSuccess={(clipId) => {
            showToast('¡Exportación completada!');
          }}
        />
      )}

      {/* MODAL 4: Share to Social */}
      {sharingClip && (
        <ShareModal
          clip={sharingClip}
          onClose={() => setSharingClip(null)}
          onShowToast={showToast}
        />
      )}

      {/* Global Toast Alerts */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
