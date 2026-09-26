import type { VideoProviderName } from "@/types/database";
import type { VideoProvider } from "./types";

const PLACEHOLDER_VIDEO_URL =
  "https://placehold.co/1280x720/0B1F3A/ffffff?text=Maxpro+Academy+Video";

class PlaceholderProvider implements VideoProvider {
  async upload(_file: File | Blob, meta?: Record<string, unknown>): Promise<string> {
    const id = `placeholder-${Date.now()}`;
    if (meta) {
      void meta;
    }
    return id;
  }

  async getPlaybackUrl(videoId: string): Promise<string> {
    const label = encodeURIComponent(videoId || "Preview");
    return `https://placehold.co/1280x720/0B1F3A/ffffff?text=${label}`;
  }

  async delete(_videoId: string): Promise<void> {
    return;
  }
}

class ExternalUrlProvider implements VideoProvider {
  private readonly urlMap = new Map<string, string>();

  async upload(file: File | Blob, meta?: Record<string, unknown>): Promise<string> {
    const id = `external-${Date.now()}`;
    const url =
      typeof meta?.url === "string"
        ? meta.url
        : file instanceof File
          ? file.name
          : PLACEHOLDER_VIDEO_URL;

    this.urlMap.set(id, url);
    return id;
  }

  async getPlaybackUrl(videoId: string): Promise<string> {
    return this.urlMap.get(videoId) ?? videoId;
  }

  async delete(videoId: string): Promise<void> {
    this.urlMap.delete(videoId);
  }
}

class YoutubeProvider implements VideoProvider {
  async upload(_file: File | Blob, meta?: Record<string, unknown>): Promise<string> {
    if (typeof meta?.youtubeId === "string") {
      return meta.youtubeId;
    }

    if (typeof meta?.url === "string") {
      const extracted = extractYoutubeId(meta.url);
      if (extracted) {
        return extracted;
      }
    }

    throw new Error("YouTube uploads require a youtubeId or valid YouTube URL in meta");
  }

  async getPlaybackUrl(videoId: string): Promise<string> {
    const id = extractYoutubeId(videoId) ?? videoId;
    return `https://www.youtube.com/embed/${id}`;
  }

  async delete(_videoId: string): Promise<void> {
    return;
  }
}

const providers: Record<VideoProviderName, VideoProvider> = {
  placeholder: new PlaceholderProvider(),
  external: new ExternalUrlProvider(),
  youtube: new YoutubeProvider(),
  vimeo: new ExternalUrlProvider(),
  mux: new ExternalUrlProvider(),
  cloudflare: new ExternalUrlProvider(),
};

export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();

  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/")[2];
        return id ?? null;
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        return id ?? null;
      }

      const watchId = url.searchParams.get("v");
      if (watchId) {
        return watchId;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function toYoutubeEmbedUrl(input: string): string {
  const id = extractYoutubeId(input);
  if (!id) {
    return input;
  }

  return `https://www.youtube.com/embed/${id}`;
}

export function getVideoProvider(
  providerName?: string | null,
): VideoProvider {
  const key = (providerName ?? process.env.VIDEO_PROVIDER ?? "placeholder") as VideoProviderName;
  return providers[key] ?? providers.placeholder;
}

export async function normalizePlaybackUrl(
  provider: VideoProviderName,
  videoId: string | null,
  videoUrl: string | null,
): Promise<string> {
  if (provider === "youtube") {
    if (videoUrl) {
      return toYoutubeEmbedUrl(videoUrl);
    }

    if (videoId) {
      return toYoutubeEmbedUrl(videoId);
    }

    return PLACEHOLDER_VIDEO_URL;
  }

  if (provider === "external" && videoUrl) {
    return videoUrl;
  }

  if (videoUrl) {
    return videoUrl;
  }

  if (videoId) {
    const instance = getVideoProvider(provider);
    return instance.getPlaybackUrl(videoId);
  }

  return getVideoProvider("placeholder").getPlaybackUrl("preview");
}
