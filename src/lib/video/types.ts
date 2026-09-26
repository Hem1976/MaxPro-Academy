import type { VideoProviderName } from "@/types/database";

export interface VideoProvider {
  upload(file: File | Blob, meta?: Record<string, unknown>): Promise<string>;
  getPlaybackUrl(videoId: string): Promise<string>;
  delete(videoId: string): Promise<void>;
}

export type VideoProviderType = VideoProviderName;

export interface PlaybackSource {
  provider: VideoProviderName;
  videoId: string | null;
  videoUrl: string | null;
}
