import express, { Request, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth.ts';
import {
  getProjectsByUser,
  getProjectWithClips,
  createProjectWithClips,
  getAllUserClips,
  updateClipData,
  deleteProjectById,
  getUserSettings,
  updateUserSettings,
  getOrCreateUser,
} from '../db/queries.ts';
import { seedDemoDataIfEmpty } from '../db/seed.ts';

export const apiRouter = express.Router();

// Auto-seed on first request if empty
let isSeeded = false;
apiRouter.use(async (_req, _res, next) => {
  if (!isSeeded) {
    try {
      await seedDemoDataIfEmpty();
      isSeeded = true;
    } catch (e) {
      console.warn('Auto-seed check error:', e);
    }
  }
  next();
});

// Sync current user
apiRouter.post('/auth/sync', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'No user provided' });
    }
    const synced = await getOrCreateUser(
      user.uid,
      user.email || 'creator@clippulse.ai',
      'name' in user ? user.name : undefined,
      'picture' in user ? (user as any).picture : undefined
    );
    res.json(synced);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Get user settings
apiRouter.get('/settings', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const settings = await getUserSettings(userId);
    res.json(settings);
  } catch (error: any) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: error.message || 'Failed to get settings' });
  }
});

// Update user settings
apiRouter.put('/settings', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const updated = await updateUserSettings(userId, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// Get all projects
apiRouter.get('/projects', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const list = await getProjectsByUser(userId);
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
});

// Get single project with clips
apiRouter.get('/projects/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const projectId = parseInt(req.params.id, 10);
    const project = await getProjectWithClips(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch project' });
  }
});

// Delete project
apiRouter.delete('/projects/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const projectId = parseInt(req.params.id, 10);
    const result = await deleteProjectById(projectId, userId);
    res.json({ success: true, deleted: result });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message || 'Failed to delete project' });
  }
});

// Get all clips (Library view)
apiRouter.get('/clips', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const clipsList = await getAllUserClips(userId);
    res.json(clipsList);
  } catch (error: any) {
    console.error('Error fetching clips:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch clips' });
  }
});

// Update clip
apiRouter.patch('/clips/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const clipId = parseInt(req.params.id, 10);
    const updated = await updateClipData(clipId, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating clip:', error);
    res.status(500).json({ error: error.message || 'Failed to update clip' });
  }
});

// Create new project with AI analyzed clips
apiRouter.post('/projects', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'guest_creator_default';
    const { title, sourceVideoUrl, sourceDuration, thumbnailUrl, tags, clips: clipsInput } = req.body;

    if (!title || !sourceVideoUrl) {
      return res.status(400).json({ error: 'Title and source video URL are required' });
    }

    const created = await createProjectWithClips(
      userId,
      {
        title,
        sourceVideoUrl,
        sourceDuration: sourceDuration || 120,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || ['AI Video', 'Shorts']),
      },
      clipsInput || []
    );

    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
});

// AI generation from Prompt (Text/Idea to Video & Viral Clips)
apiRouter.post('/ai/generate-from-prompt', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, stylePreset } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const { generateClipsFromPrompt } = await import('./aiGenerator.ts');
    const result = await generateClipsFromPrompt(prompt, stylePreset);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating from prompt:', error);
    res.status(500).json({ error: error.message || 'Failed to generate clips from prompt' });
  }
});

// Parse video metadata from URL
apiRouter.post('/ai/parse-url', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const { parseVideoUrl } = await import('./aiGenerator.ts');
    const result = parseVideoUrl(url);
    res.json(result);
  } catch (error: any) {
    console.error('Error parsing video URL:', error);
    res.status(500).json({ error: error.message || 'Failed to parse video URL' });
  }
});
