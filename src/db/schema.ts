import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth uid as anchor)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects table (original source videos processed by AI)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  sourceVideoUrl: text('source_video_url').notNull(),
  sourceDuration: integer('source_duration').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  status: text('status').notNull().default('ready'),
  tags: text('tags'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Clips table (AI generated short clips, trim boundaries, virality score & karaoke captions)
export const clips = pgTable('clips', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  viralityScore: integer('virality_score').notNull(),
  hookReason: text('hook_reason').notNull(),
  startTime: real('start_time').notNull(),
  endTime: real('end_time').notNull(),
  duration: real('duration').notNull(),
  aspectRatio: text('aspect_ratio').notNull().default('9:16'),
  subtitles: text('subtitles').notNull(),
  stylePreset: text('style_preset').notNull().default('bold_yellow'),
  exported: boolean('exported').default(false),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// User settings / presets
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  autoFraming: boolean('auto_framing').default(true),
  subtitlesStyle: text('subtitles_style').default('bold_yellow'),
  preferredAspectRatio: text('preferred_aspect_ratio').default('9:16'),
  exportResolution: text('export_resolution').default('1080p'),
  aiModelPreset: text('ai_model_preset').default('viral_hooks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  clips: many(clips),
}));

export const clipsRelations = relations(clips, ({ one }) => ({
  project: one(projects, {
    fields: [clips.projectId],
    references: [projects.id],
  }),
}));
