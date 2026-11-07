import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Curated royalty-free, high-bandwidth background video loops for generated themes
const THEMATIC_VIDEOS: Record<string, { url: string; thumb: string }> = {
  finance: {
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
  },
  tech: {
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
  },
  productivity: {
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
  },
  motivation: {
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  },
  general: {
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
  },
};

export interface GeneratedClipData {
  title: string;
  viralityScore: number;
  hookReason: string;
  startTime: number;
  endTime: number;
  duration: number;
  subtitles: Array<{ word: string; start: number; end: number }>;
}

export interface GeneratedProjectData {
  title: string;
  sourceVideoUrl: string;
  thumbnailUrl: string;
  sourceDuration: number;
  tags: string[];
  clips: GeneratedClipData[];
}

export async function generateClipsFromPrompt(prompt: string, stylePreset = 'bold_yellow'): Promise<GeneratedProjectData> {
  // If Gemini API is available, generate real AI viral script and word timestamps
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Eres un director de contenido viral y experto en retención para TikTok, Instagram Reels y YouTube Shorts (estilo Alex Hormozi y MrBeast).
A partir de la siguiente idea o prompt del usuario, crea un proyecto de video y 3 clips virales cortos (entre 12 y 18 segundos cada uno).

Idea del usuario: "${prompt}"

Para cada clip debes generar:
1. Un título de gancho irresistible y dramático (con emojis).
2. Puntuación de viralidad entre 88 y 99.
3. Explicación del gancho psicológico en los primeros 2 segundos.
4. Un guión hablado conciso de 15 a 25 palabras, desglosado en un arreglo de palabras con marcas de tiempo relativas (segundos de inicio 'start' y fin 'end', comenzando en 0.5s y terminando en 14s aprox).
5. Un tema: 'finance', 'tech', 'productivity', 'motivation' o 'general'.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectTitle: { type: Type.STRING },
              theme: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              clips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    viralityScore: { type: Type.INTEGER },
                    hookReason: { type: Type.STRING },
                    duration: { type: Type.NUMBER },
                    words: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          word: { type: Type.STRING },
                          start: { type: Type.NUMBER },
                          end: { type: Type.NUMBER },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.projectTitle && parsed.clips && parsed.clips.length > 0) {
        const themeKey = (parsed.theme || 'general').toLowerCase();
        const media = THEMATIC_VIDEOS[themeKey] || THEMATIC_VIDEOS.general;

        return {
          title: parsed.projectTitle,
          sourceVideoUrl: media.url,
          thumbnailUrl: media.thumb,
          sourceDuration: 120,
          tags: parsed.tags || ['IA', 'Viral', 'Shorts'],
          clips: parsed.clips.map((c: any, idx: number) => {
            const startT = idx * 1.5;
            const endT = startT + (c.duration || 13);
            return {
              title: c.title,
              viralityScore: c.viralityScore || 95,
              hookReason: c.hookReason || 'Gancho de alta retención basado en curiosidad inmediata.',
              startTime: startT,
              endTime: endT,
              duration: endT - startT,
              subtitles: c.words || [
                { word: 'ESTE', start: startT, end: startT + 0.4 },
                { word: 'ES', start: startT + 0.4, end: startT + 0.7 },
                { word: 'EL', start: startT + 0.7, end: startT + 0.9 },
                { word: 'SECRETO', start: startT + 0.9, end: startT + 1.6 },
                { word: 'QUE', start: startT + 1.6, end: startT + 1.8 },
                { word: 'CAMBIARÁ', start: startT + 1.8, end: startT + 2.5 },
                { word: 'TODO.', start: startT + 2.5, end: startT + 3.4 },
              ],
            };
          }),
        };
      }
    } catch (err) {
      console.warn('Gemini API call warning, falling back to smart heuristic:', err);
    }
  }

  // Smart heuristic fallback if API key is not configured or in case of transient network limit
  const cleanPrompt = prompt.trim();
  const theme = cleanPrompt.toLowerCase().includes('dolar') ||
    cleanPrompt.toLowerCase().includes('dinero') ||
    cleanPrompt.toLowerCase().includes('finan') ||
    cleanPrompt.toLowerCase().includes('inver')
    ? 'finance'
    : cleanPrompt.toLowerCase().includes('ia') ||
      cleanPrompt.toLowerCase().includes('tech') ||
      cleanPrompt.toLowerCase().includes('comput')
    ? 'tech'
    : cleanPrompt.toLowerCase().includes('habito') ||
      cleanPrompt.toLowerCase().includes('tiempo') ||
      cleanPrompt.toLowerCase().includes('productiv')
    ? 'productivity'
    : 'general';

  const media = THEMATIC_VIDEOS[theme];

  return {
    title: `Video IA: ${cleanPrompt.slice(0, 45)}...`,
    sourceVideoUrl: media.url,
    thumbnailUrl: media.thumb,
    sourceDuration: 120,
    tags: ['Prompt IA', 'Shorts', theme.toUpperCase()],
    clips: [
      {
        title: `🔥 El 99% ignora esto: ${cleanPrompt.slice(0, 32)}`,
        viralityScore: 97,
        hookReason: 'Inicia con sesgo de exclusión y promesa de conocimiento privilegiado.',
        startTime: 0.5,
        endTime: 13.5,
        duration: 13.0,
        subtitles: [
          { word: 'SI', start: 0.5, end: 0.8 },
          { word: 'QUIERES', start: 0.8, end: 1.3 },
          { word: 'DOMINAR', start: 1.3, end: 2.0 },
          { word: 'ESTE', start: 2.0, end: 2.4 },
          { word: 'TEMA,', start: 2.4, end: 3.0 },
          { word: 'DEBES', start: 3.2, end: 3.7 },
          { word: 'DEJAR', start: 3.7, end: 4.2 },
          { word: 'DE', start: 4.2, end: 4.4 },
          { word: 'HACER', start: 4.4, end: 4.9 },
          { word: 'LO', start: 4.9, end: 5.1 },
          { word: 'QUE', start: 5.1, end: 5.3 },
          { word: 'HACEN', start: 5.3, end: 5.8 },
          { word: 'TODOS.', start: 5.8, end: 6.7 },
        ],
      },
      {
        title: `💡 La verdad incómoda que nadie te cuenta`,
        viralityScore: 93,
        hookReason: 'Ruptura de patrón mental en el segundo 1.2 que maximiza la tasa de finalización.',
        startTime: 1.0,
        endTime: 14.0,
        duration: 13.0,
        subtitles: [
          { word: 'TODO', start: 1.0, end: 1.4 },
          { word: 'EL', start: 1.4, end: 1.6 },
          { word: 'MUNDO', start: 1.6, end: 2.2 },
          { word: 'TE', start: 2.2, end: 2.4 },
          { word: 'MINTIÓ', start: 2.4, end: 3.1 },
          { word: 'SOBRE', start: 3.1, end: 3.6 },
          { word: 'ESTO.', start: 3.6, end: 4.3 },
          { word: 'LA', start: 4.6, end: 4.8 },
          { word: 'CLAVE', start: 4.8, end: 5.4 },
          { word: 'REAL', start: 5.4, end: 6.0 },
          { word: 'ES', start: 6.0, end: 6.3 },
          { word: 'MUCHO', start: 6.3, end: 6.8 },
          { word: 'MÁS', start: 6.8, end: 7.1 },
          { word: 'SIMPLE.', start: 7.1, end: 8.0 },
        ],
      },
      {
        title: `⚡ La regla de los 3 pasos para aplicarlo hoy`,
        viralityScore: 89,
        hookReason: 'Accionabilidad inmediata con estructura de lista mental.',
        startTime: 0.0,
        endTime: 12.0,
        duration: 12.0,
        subtitles: [
          { word: 'PASO', start: 0.0, end: 0.5 },
          { word: 'UNO:', start: 0.5, end: 1.1 },
          { word: 'ELIMINA', start: 1.3, end: 2.0 },
          { word: 'DISTRACCIONES.', start: 2.0, end: 3.1 },
          { word: 'PASO', start: 3.4, end: 3.8 },
          { word: 'DOS:', start: 3.8, end: 4.4 },
          { word: 'EJECUTA', start: 4.6, end: 5.3 },
          { word: 'SIN', start: 5.3, end: 5.6 },
          { word: 'MIEDO.', start: 5.6, end: 6.5 },
        ],
      },
    ],
  };
}

export function parseVideoUrl(inputUrl: string) {
  let title = 'Video Importado vía Enlace';
  let category = 'Web Video';
  let videoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  let thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) {
    title = 'YouTube: Entrevista & Masterclass Viral';
    category = 'YouTube';
    thumbnailUrl = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80';
  } else if (inputUrl.includes('tiktok.com')) {
    title = 'TikTok Trending Video Importado';
    category = 'TikTok';
    thumbnailUrl = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80';
  } else if (inputUrl.includes('loom.com') || inputUrl.includes('vimeo.com')) {
    title = 'Video Loom / Vimeo Corporativo';
    category = 'SaaS & Tech';
    thumbnailUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
  } else if (inputUrl.endsWith('.mp4') || inputUrl.endsWith('.webm') || inputUrl.startsWith('http')) {
    // Direct link to video
    videoUrl = inputUrl;
    title = 'Video Directo MP4';
  }

  return {
    title,
    category,
    videoUrl,
    thumbnailUrl,
    sourceDuration: 180,
  };
}
