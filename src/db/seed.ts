import { db } from './index.ts';
import { projects, clips, users, userSettings } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDemoDataIfEmpty() {
  try {
    const existingProjects = await db.select().from(projects).limit(1);
    if (existingProjects.length > 0) {
      return;
    }

    console.log('Seeding initial ClipPulse creator projects into Cloud SQL...');

    // Seed default user
    const [user] = await db
      .insert(users)
      .values({
        uid: 'guest_creator_default',
        email: 'creator@clippulse.ai',
        name: 'Alex Rivera (Creator Pro)',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      })
      .onConflictDoNothing()
      .returning();

    await db
      .insert(userSettings)
      .values({
        userId: 'guest_creator_default',
        autoFraming: true,
        subtitlesStyle: 'bold_yellow',
        preferredAspectRatio: '9:16',
        exportResolution: '1080p',
        aiModelPreset: 'viral_hooks',
      })
      .onConflictDoNothing();

    // Project 1: The AI Masterclass Podcast
    const [project1] = await db
      .insert(projects)
      .values({
        userId: 'guest_creator_default',
        title: 'Masterclass: El Futuro del Trabajo con Inteligencia Artificial',
        sourceVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        sourceDuration: 180,
        thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
        status: 'ready',
        tags: JSON.stringify(['Podcast', 'Tecnología', 'Productividad']),
      })
      .returning();

    // Clips for Project 1
    const clipsP1 = [
      {
        projectId: project1.id,
        title: '🔥 La regla de oro que cambiará tu carrera en 10 meses',
        viralityScore: 97,
        hookReason: 'Gancho de alta retención psicológica en los primeros 2.5s con declaración contraintuitiva sobre hábitos diarios.',
        startTime: 1.0,
        endTime: 14.0,
        duration: 13.0,
        aspectRatio: '9:16',
        stylePreset: 'bold_yellow',
        exported: true,
        views: 14200,
        subtitles: JSON.stringify([
          { word: 'SI', start: 1.0, end: 1.4 },
          { word: 'ENTIENDES', start: 1.4, end: 2.1 },
          { word: 'ESTE', start: 2.1, end: 2.5 },
          { word: 'CONCEPTO,', start: 2.5, end: 3.2 },
          { word: 'VAS', start: 3.5, end: 3.8 },
          { word: 'A', start: 3.8, end: 4.0 },
          { word: 'SUPERAR', start: 4.0, end: 4.7 },
          { word: 'AL', start: 4.7, end: 5.0 },
          { word: '99%', start: 5.0, end: 5.8 },
          { word: 'DE', start: 5.8, end: 6.0 },
          { word: 'LA', start: 6.0, end: 6.2 },
          { word: 'COMPETENCIA.', start: 6.2, end: 7.2 },
          { word: 'NO', start: 7.5, end: 7.9 },
          { word: 'SE', start: 7.9, end: 8.2 },
          { word: 'TRATA', start: 8.2, end: 8.7 },
          { word: 'DE', start: 8.7, end: 8.9 },
          { word: 'TRABAJAR', start: 8.9, end: 9.6 },
          { word: 'MÁS,', start: 9.6, end: 10.2 },
          { word: 'SINO', start: 10.5, end: 11.0 },
          { word: 'DE', start: 11.0, end: 11.2 },
          { word: 'AUTOMATIZAR', start: 11.2, end: 12.5 },
          { word: 'TODO.', start: 12.5, end: 13.5 },
        ]),
      },
      {
        projectId: project1.id,
        title: '💡 Por qué el 90% de los negocios fallan al usar ChatGPT',
        viralityScore: 93,
        hookReason: 'Identifica un error común y despierta curiosidad inmediata mediante el sesgo de negatividad.',
        startTime: 3.0,
        endTime: 15.0,
        duration: 12.0,
        aspectRatio: '9:16',
        stylePreset: 'neon_purple',
        exported: false,
        views: 8900,
        subtitles: JSON.stringify([
          { word: 'TODOS', start: 3.0, end: 3.6 },
          { word: 'COMETEN', start: 3.6, end: 4.2 },
          { word: 'EL', start: 4.2, end: 4.5 },
          { word: 'MISMO', start: 4.5, end: 5.1 },
          { word: 'ERROR', start: 5.1, end: 5.8 },
          { word: 'CON', start: 6.0, end: 6.3 },
          { word: 'LOS', start: 6.3, end: 6.6 },
          { word: 'PROMPTS.', start: 6.6, end: 7.4 },
          { word: 'LE', start: 7.6, end: 7.9 },
          { word: 'PIDEN', start: 7.9, end: 8.4 },
          { word: 'IDEAS', start: 8.4, end: 9.0 },
          { word: 'EN', start: 9.2, end: 9.5 },
          { word: 'LUGAR', start: 9.5, end: 10.0 },
          { word: 'DE', start: 10.0, end: 10.2 },
          { word: 'SISTEMAS', start: 10.2, end: 11.2 },
          { word: 'COMPLETOS.', start: 11.2, end: 12.2 },
        ]),
      },
      {
        projectId: project1.id,
        title: '⚡ El método de 3 minutos para crear contenido masivo',
        viralityScore: 89,
        hookReason: 'Promesa de resultado rápido con número específico y aplicabilidad instantánea para redes sociales.',
        startTime: 2.0,
        endTime: 14.0,
        duration: 12.0,
        aspectRatio: '9:16',
        stylePreset: 'cyber_cyan',
        exported: false,
        views: 4500,
        subtitles: JSON.stringify([
          { word: 'TRES', start: 2.0, end: 2.5 },
          { word: 'MINUTOS.', start: 2.5, end: 3.2 },
          { word: 'ESO', start: 3.5, end: 3.8 },
          { word: 'ES', start: 3.8, end: 4.1 },
          { word: 'TODO', start: 4.1, end: 4.6 },
          { word: 'LO', start: 4.6, end: 4.8 },
          { word: 'QUE', start: 4.8, end: 5.0 },
          { word: 'NECESITAS', start: 5.0, end: 5.8 },
          { word: 'PARA', start: 5.8, end: 6.1 },
          { word: 'CREAR', start: 6.1, end: 6.8 },
          { word: 'TREINTA', start: 6.8, end: 7.6 },
          { word: 'SHORTS', start: 7.6, end: 8.4 },
          { word: 'AL', start: 8.4, end: 8.7 },
          { word: 'MES.', start: 8.7, end: 9.5 },
        ]),
      },
      {
        projectId: project1.id,
        title: '🚀 Así monetizan los creadores sin millones de seguidores',
        viralityScore: 86,
        hookReason: 'Ataca la creencia limitante de que se necesita una audiencia masiva para generar ingresos.',
        startTime: 1.5,
        endTime: 13.5,
        duration: 12.0,
        aspectRatio: '9:16',
        stylePreset: 'clean_white',
        exported: false,
        views: 3100,
        subtitles: JSON.stringify([
          { word: 'NO', start: 1.5, end: 1.9 },
          { word: 'NECESITAS', start: 1.9, end: 2.7 },
          { word: 'UN', start: 2.7, end: 3.0 },
          { word: 'MILLÓN', start: 3.0, end: 3.8 },
          { word: 'DE', start: 3.8, end: 4.0 },
          { word: 'SEGUIDORES.', start: 4.0, end: 5.0 },
          { word: 'SOLO', start: 5.3, end: 5.8 },
          { word: 'NECESITAS', start: 5.8, end: 6.6 },
          { word: 'CIEN', start: 6.6, end: 7.2 },
          { word: 'CLIENTES', start: 7.2, end: 8.0 },
          { word: 'IDEALES.', start: 8.0, end: 9.0 },
        ]),
      },
    ];

    for (const c of clipsP1) {
      await db.insert(clips).values(c);
    }

    // Project 2: Entrevista Tech & Startups
    const [project2] = await db
      .insert(projects)
      .values({
        userId: 'guest_creator_default',
        title: 'Entrevista Fundadores: De 0 a $1M ARR en 12 Meses',
        sourceVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        sourceDuration: 120,
        thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
        status: 'ready',
        tags: JSON.stringify(['Startups', 'Finanzas', 'Emprendimiento']),
      })
      .returning();

    const clipsP2 = [
      {
        projectId: project2.id,
        title: '🎯 El error de fijación de precios que casi quiebra la empresa',
        viralityScore: 95,
        hookReason: 'Confesión de vulnerabilidad y fracaso con alto drama narrativo.',
        startTime: 2.0,
        endTime: 14.0,
        duration: 12.0,
        aspectRatio: '9:16',
        stylePreset: 'bold_yellow',
        exported: true,
        views: 21500,
        subtitles: JSON.stringify([
          { word: 'COBRÁBAMOS', start: 2.0, end: 2.8 },
          { word: 'DIEZ', start: 2.8, end: 3.3 },
          { word: 'DÓLARES.', start: 3.3, end: 4.0 },
          { word: 'ESTÁBAMOS', start: 4.3, end: 5.1 },
          { word: 'A', start: 5.1, end: 5.3 },
          { word: 'DOS', start: 5.3, end: 5.8 },
          { word: 'SEMANAS', start: 5.8, end: 6.5 },
          { word: 'DE', start: 6.5, end: 6.8 },
          { word: 'CERRAR.', start: 6.8, end: 7.7 },
          { word: 'CUANDO', start: 8.0, end: 8.5 },
          { word: 'SUBIMOS', start: 8.5, end: 9.2 },
          { word: 'EL', start: 9.2, end: 9.5 },
          { word: 'PRECIO,', start: 9.5, end: 10.2 },
          { word: 'TODO', start: 10.4, end: 10.8 },
          { word: 'CAMBIÓ.', start: 10.8, end: 11.8 },
        ]),
      },
      {
        projectId: project2.id,
        title: '📈 La métrica que los inversores realmente miran',
        viralityScore: 91,
        hookReason: 'Información interna revelada por un experto del sector.',
        startTime: 1.0,
        endTime: 12.0,
        duration: 11.0,
        aspectRatio: '9:16',
        stylePreset: 'neon_purple',
        exported: false,
        views: 11200,
        subtitles: JSON.stringify([
          { word: 'A', start: 1.0, end: 1.2 },
          { word: 'NADIE', start: 1.2, end: 1.8 },
          { word: 'LE', start: 1.8, end: 2.0 },
          { word: 'IMPORTA', start: 2.0, end: 2.7 },
          { word: 'TU', start: 2.7, end: 3.0 },
          { word: 'TRÁFICO', start: 3.0, end: 3.8 },
          { word: 'WEB.', start: 3.8, end: 4.5 },
          { word: 'MIRAN', start: 4.8, end: 5.4 },
          { word: 'LA', start: 5.4, end: 5.7 },
          { word: 'RETENCIÓN', start: 5.7, end: 6.6 },
          { word: 'A', start: 6.6, end: 6.8 },
          { word: 'NOVENTA', start: 6.8, end: 7.6 },
          { word: 'DÍAS.', start: 7.6, end: 8.5 },
        ]),
      },
    ];

    for (const c of clipsP2) {
      await db.insert(clips).values(c);
    }

    console.log('Seeded demo projects and clips successfully!');
  } catch (error) {
    console.error('Seed demo data error:', error);
  }
}
