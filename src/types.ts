export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export type AspectRatioType = '9:16' | '16:9' | '1:1';
export type SubtitleStyleType = 'bold_yellow' | 'neon_purple' | 'cyber_cyan' | 'clean_white';

export interface Clip {
  id: number;
  projectId: number;
  title: string;
  viralityScore: number;
  hookReason: string;
  startTime: number;
  endTime: number;
  duration: number;
  aspectRatio: AspectRatioType;
  subtitles: string; // JSON string of SubtitleWord[]
  stylePreset: SubtitleStyleType;
  exported: boolean;
  views: number;
  createdAt?: string;
  projectTitle?: string;
  sourceVideoUrl?: string;
}

export interface Project {
  id: number;
  userId: string;
  title: string;
  sourceVideoUrl: string;
  sourceDuration: number;
  thumbnailUrl?: string | null;
  status: string;
  tags?: string | null;
  createdAt?: string;
  clips?: Clip[];
}

export interface UserSettings {
  id?: number;
  userId: string;
  autoFraming: boolean;
  subtitlesStyle: SubtitleStyleType;
  preferredAspectRatio: AspectRatioType;
  exportResolution: string;
  aiModelPreset: string;
}

export interface SampleVideo {
  id: string;
  title: string;
  category: string;
  duration: number;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  tags: string[];
  demoClips: Array<{
    title: string;
    viralityScore: number;
    hookReason: string;
    startTime: number;
    endTime: number;
    stylePreset: SubtitleStyleType;
    subtitles: SubtitleWord[];
  }>;
}
