/**
 * Resolve YouTube playlist / single-video URLs into ordered video items.
 * Uses public playlist HTML (ytInitialData) — no API key required.
 */

export interface YoutubePlaylistVideo {
  videoId: string;
  title: string;
  index: number;
  url: string;
  embedUrl: string;
  durationSeconds?: number | null;
}

export interface YoutubePlaylistResult {
  playlistId: string | null;
  title: string | null;
  videos: YoutubePlaylistVideo[];
  source: "playlist" | "single" | "empty";
  warning?: string;
}

export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const list = url.searchParams.get("list");
    if (list) return list;
  } catch {
    // fall through
  }

  const bare = trimmed.match(
    /^(PL[\w-]{10,}|UU[\w-]{10,}|LL[\w-]{10,}|OL[\w-]{10,})$/,
  );
  return bare?.[1] ?? null;
}

export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] ?? null;
      }
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] ?? null;
      }
      if (url.pathname.startsWith("/live/")) {
        return url.pathname.split("/")[2] ?? null;
      }
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function toEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

function toWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function parseDurationLabel(label: string | undefined): number | null {
  if (!label) return null;
  const parts = label.trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return null;
}

function readTitle(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const record = node as {
    runs?: Array<{ text?: string }>;
    simpleText?: string;
  };
  if (record.simpleText) return record.simpleText;
  if (record.runs?.length) {
    return record.runs.map((run) => run.text ?? "").join("");
  }
  return null;
}

function collectPlaylistVideos(data: unknown): YoutubePlaylistVideo[] {
  const byId = new Map<
    string,
    { title?: string; index?: number; durationSeconds?: number | null }
  >();

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    const record = node as Record<string, unknown>;

    const renderer = (record.playlistVideoRenderer ||
      record.playlistPanelVideoRenderer ||
      record.videoRenderer) as
      | {
          videoId?: string;
          title?: unknown;
          lengthText?: { simpleText?: string };
          index?: { simpleText?: string } | number;
        }
      | undefined;

    if (renderer?.videoId) {
      const existing = byId.get(renderer.videoId) ?? {};
      const title = readTitle(renderer.title)?.trim();
      const indexValue =
        typeof renderer.index === "number"
          ? renderer.index
          : Number(renderer.index?.simpleText);
      byId.set(renderer.videoId, {
        title: title || existing.title,
        index: Number.isFinite(indexValue) ? indexValue : existing.index,
        durationSeconds:
          parseDurationLabel(renderer.lengthText?.simpleText) ??
          existing.durationSeconds,
      });
    }

    // Compact watch endpoints that include playlist index
    if (
      typeof record.videoId === "string" &&
      /^[\w-]{11}$/.test(record.videoId) &&
      typeof record.playlistId === "string" &&
      typeof record.index === "number"
    ) {
      const existing = byId.get(record.videoId) ?? {};
      byId.set(record.videoId, {
        ...existing,
        index: record.index,
      });
    }

    for (const value of Object.values(record)) {
      visit(value);
    }
  };

  visit(data);

  // Regex fallback for IDs if walk found none
  if (byId.size === 0 && data) {
    const raw = JSON.stringify(data);
    const ids = [...raw.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
    for (const videoId of new Set(ids)) {
      byId.set(videoId, {});
    }
  }

  const entries = [...byId.entries()].map(([videoId, meta], fallbackIndex) => ({
    videoId,
    title: meta.title,
    index: meta.index ?? fallbackIndex,
    durationSeconds: meta.durationSeconds ?? null,
  }));

  entries.sort((a, b) => a.index - b.index);

  return entries.map((entry, index) => ({
    videoId: entry.videoId,
    title: entry.title || `Video ${index + 1}`,
    index,
    url: toWatchUrl(entry.videoId),
    embedUrl: toEmbedUrl(entry.videoId),
    durationSeconds: entry.durationSeconds,
  }));
}

async function enrichVideoTitles(
  videos: YoutubePlaylistVideo[],
): Promise<YoutubePlaylistVideo[]> {
  const needsTitle = videos.filter((video) =>
    /^Video \d+$/.test(video.title),
  );
  if (needsTitle.length === 0) return videos;

  const enriched = await Promise.all(
    videos.map(async (video) => {
      if (!/^Video \d+$/.test(video.title)) return video;
      try {
        const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(
          video.url,
        )}&format=json`;
        const response = await fetch(oembed, { cache: "no-store" });
        if (!response.ok) return video;
        const data = (await response.json()) as { title?: string };
        if (!data.title) return video;
        return { ...video, title: data.title };
      } catch {
        return video;
      }
    }),
  );

  return enriched;
}

function extractYtInitialData(html: string): unknown | null {
  const markerIndex = html.indexOf("ytInitialData");
  if (markerIndex === -1) return null;

  const jsonStart = html.indexOf("{", markerIndex);
  if (jsonStart === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = jsonStart; i < html.length; i += 1) {
    const ch = html[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) return null;

  try {
    return JSON.parse(html.slice(jsonStart, end));
  } catch {
    return null;
  }
}

function extractPlaylistTitle(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const metadata = root.metadata as
    | {
        playlistMetadataRenderer?: { title?: string };
      }
    | undefined;
  if (metadata?.playlistMetadataRenderer?.title) {
    return metadata.playlistMetadataRenderer.title;
  }

  const header = root.header as
    | {
        playlistHeaderRenderer?: { title?: unknown };
      }
    | undefined;
  return readTitle(header?.playlistHeaderRenderer?.title);
}

function extractAlert(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const root = data as {
    alerts?: Array<{
      alertRenderer?: { text?: { runs?: Array<{ text?: string }> } };
    }>;
  };
  return root.alerts?.[0]?.alertRenderer?.text?.runs?.[0]?.text ?? null;
}

async function fetchPlaylistFromHtml(
  playlistId: string,
): Promise<YoutubePlaylistResult> {
  const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      playlistId,
      title: null,
      videos: [],
      source: "empty",
      warning: `Unable to load playlist (${response.status}).`,
    };
  }

  const html = await response.text();
  const data = extractYtInitialData(html);
  if (!data) {
    return {
      playlistId,
      title: null,
      videos: [],
      source: "empty",
      warning:
        "Could not parse playlist contents. Confirm the playlist is public.",
    };
  }

  const alert = extractAlert(data);
  if (alert) {
    return {
      playlistId,
      title: null,
      videos: [],
      source: "empty",
      warning: alert,
    };
  }

  const videos = await enrichVideoTitles(collectPlaylistVideos(data));

  return {
    playlistId,
    title: extractPlaylistTitle(data),
    videos,
    source: videos.length > 0 ? "playlist" : "empty",
    warning:
      videos.length === 0
        ? "Playlist loaded but no public videos were found. Use a public playlist URL."
        : undefined,
  };
}

async function fetchSingleVideo(url: string): Promise<YoutubePlaylistResult> {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    return {
      playlistId: null,
      title: null,
      videos: [],
      source: "empty",
      warning: "Not a valid YouTube video or playlist URL.",
    };
  }

  let title = `YouTube video ${videoId}`;
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      toWatchUrl(videoId),
    )}&format=json`;
    const response = await fetch(oembed, { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { title?: string };
      if (data.title) title = data.title;
    }
  } catch {
    // keep fallback title
  }

  return {
    playlistId: null,
    title,
    videos: [
      {
        videoId,
        title,
        index: 0,
        url: toWatchUrl(videoId),
        embedUrl: toEmbedUrl(videoId),
        durationSeconds: null,
      },
    ],
    source: "single",
  };
}

export async function resolveYoutubeSource(
  url: string,
): Promise<YoutubePlaylistResult> {
  const trimmed = url.trim();
  if (!trimmed) {
    return {
      playlistId: null,
      title: null,
      videos: [],
      source: "empty",
    };
  }

  const playlistId = extractPlaylistId(trimmed);
  if (playlistId) {
    const playlist = await fetchPlaylistFromHtml(playlistId);
    if (playlist.videos.length > 0) {
      return playlist;
    }

    const single = await fetchSingleVideo(trimmed);
    if (single.videos.length > 0) {
      return {
        ...single,
        playlistId,
        warning:
          playlist.warning ??
          "Playlist videos could not be listed; using the single linked video instead.",
      };
    }

    return playlist;
  }

  return fetchSingleVideo(trimmed);
}

export function formatPlaylistForPrompt(
  playlist: YoutubePlaylistResult,
): string {
  if (playlist.videos.length === 0) {
    return "No YouTube videos resolved.";
  }

  const header = [
    playlist.source === "playlist"
      ? `YouTube playlist: ${playlist.title ?? playlist.playlistId ?? "Untitled"}`
      : `YouTube video: ${playlist.title ?? playlist.videos[0]?.title}`,
    `Video count: ${playlist.videos.length}`,
    "Create exactly one lesson per video below, in this order. Use each video title as the lesson title (you may lightly polish).",
    "Each lesson must include youtubeVideoId matching the listed video.",
  ];

  const lines = playlist.videos.map(
    (video, index) =>
      `${index + 1}. [${video.videoId}] ${video.title}${
        video.durationSeconds
          ? ` (${Math.round(video.durationSeconds / 60)} min)`
          : ""
      }`,
  );

  return [...header, ...lines].join("\n");
}
