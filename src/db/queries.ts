import { db } from './index.ts';
import { users, projects, clips, userSettings } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export interface CreateClipInput {
  title: string;
  viralityScore: number;
  hookReason: string;
  startTime: number;
  endTime: number;
  duration: number;
  aspectRatio: string;
  subtitles: string;
  stylePreset: string;
}

export async function getOrCreateUser(uid: string, email: string, name?: string, photoUrl?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(photoUrl ? { photoUrl } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function getProjectsByUser(userId: string) {
  try {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  } catch (error) {
    console.error('Database getProjectsByUser failed:', error);
    throw new Error('Failed to retrieve projects.', { cause: error });
  }
}

export async function getProjectWithClips(projectId: number, userId: string) {
  try {
    const projectList = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!projectList.length) return null;

    const projectClips = await db
      .select()
      .from(clips)
      .where(eq(clips.projectId, projectId))
      .orderBy(desc(clips.viralityScore));

    return {
      ...projectList[0],
      clips: projectClips,
    };
  } catch (error) {
    console.error('Database getProjectWithClips failed:', error);
    throw new Error('Failed to retrieve project details.', { cause: error });
  }
}

export async function getAllUserClips(userId: string) {
  try {
    const results = await db
      .select({
        clip: clips,
        project: projects,
      })
      .from(clips)
      .innerJoin(projects, eq(clips.projectId, projects.id))
      .where(eq(projects.userId, userId))
      .orderBy(desc(clips.createdAt));

    return results.map((r) => ({
      ...r.clip,
      projectTitle: r.project.title,
      sourceVideoUrl: r.project.sourceVideoUrl,
    }));
  } catch (error) {
    console.error('Database getAllUserClips failed:', error);
    throw new Error('Failed to retrieve clips library.', { cause: error });
  }
}

export async function createProjectWithClips(
  userId: string,
  projectData: {
    title: string;
    sourceVideoUrl: string;
    sourceDuration: number;
    thumbnailUrl?: string;
    tags?: string;
  },
  clipsList: CreateClipInput[]
) {
  try {
    const [insertedProject] = await db
      .insert(projects)
      .values({
        userId,
        title: projectData.title,
        sourceVideoUrl: projectData.sourceVideoUrl,
        sourceDuration: projectData.sourceDuration,
        thumbnailUrl: projectData.thumbnailUrl || null,
        status: 'ready',
        tags: projectData.tags || '["AI", "Shorts", "Trending"]',
      })
      .returning();

    const insertedClips = [];
    for (const c of clipsList) {
      const [newClip] = await db
        .insert(clips)
        .values({
          projectId: insertedProject.id,
          title: c.title,
          viralityScore: c.viralityScore,
          hookReason: c.hookReason,
          startTime: c.startTime,
          endTime: c.endTime,
          duration: c.duration,
          aspectRatio: c.aspectRatio || '9:16',
          subtitles: c.subtitles,
          stylePreset: c.stylePreset || 'bold_yellow',
        })
        .returning();
      insertedClips.push(newClip);
    }

    return {
      ...insertedProject,
      clips: insertedClips,
    };
  } catch (error) {
    console.error('Database createProjectWithClips failed:', error);
    throw new Error('Failed to create project and clips.', { cause: error });
  }
}

export async function updateClipData(
  clipId: number,
  data: Partial<{
    title: string;
    startTime: number;
    endTime: number;
    duration: number;
    aspectRatio: string;
    subtitles: string;
    stylePreset: string;
    exported: boolean;
  }>
) {
  try {
    const [updated] = await db
      .update(clips)
      .set(data)
      .where(eq(clips.id, clipId))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database updateClipData failed:', error);
    throw new Error('Failed to update clip.', { cause: error });
  }
}

export async function deleteProjectById(projectId: number, userId: string) {
  try {
    // Cascades delete to clips
    return await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning();
  } catch (error) {
    console.error('Database deleteProjectById failed:', error);
    throw new Error('Failed to delete project.', { cause: error });
  }
}

export async function getUserSettings(userId: string) {
  try {
    const res = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (res.length > 0) return res[0];

    // Seed default settings
    const [created] = await db
      .insert(userSettings)
      .values({
        userId,
        autoFraming: true,
        subtitlesStyle: 'bold_yellow',
        preferredAspectRatio: '9:16',
        exportResolution: '1080p',
        aiModelPreset: 'viral_hooks',
      })
      .returning();

    return created;
  } catch (error) {
    console.error('Database getUserSettings failed:', error);
    throw new Error('Failed to fetch user settings.', { cause: error });
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<{
    autoFraming: boolean;
    subtitlesStyle: string;
    preferredAspectRatio: string;
    exportResolution: string;
    aiModelPreset: string;
  }>
) {
  try {
    const [updated] = await db
      .insert(userSettings)
      .values({
        userId,
        ...settings,
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: settings,
      })
      .returning();
    return updated;
  } catch (error) {
    console.error('Database updateUserSettings failed:', error);
    throw new Error('Failed to update user settings.', { cause: error });
  }
}
