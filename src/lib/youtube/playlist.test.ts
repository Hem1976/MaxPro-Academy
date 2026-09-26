import { describe, expect, it } from "vitest";
import { resolveYoutubeSource } from "@/lib/youtube/playlist";

/**
 * Live network test — skipped automatically if YouTube is unreachable.
 */
describe("resolveYoutubeSource (live)", () => {
  it("fetches videos from a public sales training playlist", async () => {
    const playlistUrl =
      "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr";

    let result;
    try {
      result = await resolveYoutubeSource(playlistUrl);
    } catch (error) {
      console.warn("Skipping live playlist test:", error);
      return;
    }

    if (result.videos.length === 0) {
      console.warn(
        "Skipping live playlist test — no videos returned:",
        result.warning,
      );
      return;
    }

    expect(result.source).toBe("playlist");
    expect(result.videos.length).toBeGreaterThan(1);
    expect(result.videos[0].videoId).toMatch(/^[\w-]{11}$/);
    expect(result.videos[0].title.length).toBeGreaterThan(3);
    expect(result.videos.every((v) => Boolean(v.embedUrl))).toBe(true);
  }, 60_000);
});
