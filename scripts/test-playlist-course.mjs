import { resolveYoutubeSource } from "../src/lib/youtube/playlist.ts";
import { buildCourseFromPlaylistVideos } from "../src/lib/ai/course-generator.ts";

const PLAYLIST =
  "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr";

async function main() {
  const playlist = await resolveYoutubeSource(PLAYLIST);
  console.log(
    JSON.stringify(
      {
        source: playlist.source,
        title: playlist.title,
        count: playlist.videos.length,
        warning: playlist.warning,
        sample: playlist.videos.slice(0, 3).map((v) => ({
          id: v.videoId,
          title: v.title,
        })),
      },
      null,
      2,
    ),
  );

  if (!playlist.videos.length) {
    process.exitCode = 1;
    return;
  }

  const draft = buildCourseFromPlaylistVideos(
    {
      productId: "",
      topic: "Calculus fundamentals",
      courseTitle: "Essence of Calculus",
      moduleCount: 3,
      lessonsPerModule: 4,
      quizQuestionCount: 5,
      productName: "General Training",
    },
    playlist,
  );

  const lessons = draft.modules.flatMap((m) => m.lessons);
  console.log(
    JSON.stringify(
      {
        courseTitle: draft.title,
        lessonCount: lessons.length,
        withVideo: lessons.filter((l) => l.youtubeVideoId).length,
        firstThree: lessons.slice(0, 3).map((l) => ({
          title: l.title,
          youtubeVideoId: l.youtubeVideoId,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
