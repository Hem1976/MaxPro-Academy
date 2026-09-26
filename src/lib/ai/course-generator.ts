import { slugify } from "@/lib/utils";
import {
  generatedCourseDraftSchema,
  type AiCourseGenerateInput,
  type GeneratedCourseDraft,
} from "@/lib/ai/course-schema";
import { generateLocalJson, getLocalAiStatus } from "@/lib/ai/ollama";
import {
  formatPlaylistForPrompt,
  resolveYoutubeSource,
  type YoutubePlaylistResult,
  type YoutubePlaylistVideo,
} from "@/lib/youtube/playlist";

export interface CourseGenerationResult {
  draft: GeneratedCourseDraft;
  provider: "ollama" | "fallback";
  model: string;
  warning?: string;
  youtube?: YoutubePlaylistResult;
}

function buildSystemPrompt(hasPlaylist: boolean): string {
  return `You are a Maxpro Academy instructional designer.
Create practical training courses for Maxpro Infotech customers and staff.
Return ONLY valid JSON matching the required schema.
Course titles may be any clear training name — they do NOT need to match a product name.
Use clear written walkthrough lessons with markdown headings, numbered steps, and key takeaways.
${
  hasPlaylist
    ? "When a YouTube playlist is provided, create EXACTLY one lesson per video in the given order. Every lesson MUST include youtubeVideoId from that list. Do not invent video IDs."
    : "When a YouTube reference is provided, design lessons that complement that video."
}
The quiz is a FINAL exam for the entire course. Write questions that test a specific idea from different lessons — one question per lesson/video when possible. Do not write generic study-habit questions.
Quiz questions must have exactly one correct option.
Slugs must be lowercase kebab-case.`;
}

function buildUserPrompt(
  input: AiCourseGenerateInput & {
    productName: string;
    productDescription?: string | null;
    youtubeContext?: string | null;
    videoCount?: number;
  },
): string {
  const preferredTitle =
    input.courseTitle && input.courseTitle.trim().length > 0
      ? input.courseTitle.trim()
      : null;

  const videoCount = input.videoCount ?? 0;
  const structureHint =
    videoCount > 0
      ? `IMPORTANT: There are ${videoCount} YouTube videos. Create lessons 1:1 with those videos (same order). Put youtubeVideoId on each lesson. Group into 2–4 modules if helpful, but do not drop any video.`
      : `Modules: ${input.moduleCount}
Lessons per module: ${input.lessonsPerModule}`;

  return `Create a complete Academy course draft as JSON.

Preferred course title: ${preferredTitle ?? "(invent a clear course title from the topic)"}
Linked product (optional context only): ${input.productName}
Product context: ${input.productDescription ?? "General Maxpro Academy training"}
Topic / brief: ${input.topic}
Audience: ${input.audience || "learners"}
${structureHint}
Quiz questions: ${input.quizQuestionCount} (cover the WHOLE course; each question should test a different lesson)
${input.youtubeContext ? `Reference material:\n${input.youtubeContext}` : ""}

Important:
- If a preferred course title is provided, use it (or a close polished variant) as "title".
- Do not force the product name into the course title unless it fits naturally.
- Lessons should include practical written walkthroughs.
- Include youtubeVideoId on each lesson when video IDs are provided.

JSON schema shape:
{
  "title": string,
  "slug": string,
  "shortDescription": string,
  "description": string,
  "level": "beginner" | "intermediate" | "advanced",
  "estimatedMinutes": number,
  "learningOutcomes": string[],
  "modules": [
    {
      "title": string,
      "description": string,
      "lessons": [
        {
          "title": string,
          "slug": string,
          "description": string,
          "learningObjective": string,
          "estimatedMinutes": number,
          "writtenContent": "markdown walkthrough",
          "youtubeVideoId": "optional 11-char id"
        }
      ]
    }
  ],
  "quiz": {
    "title": string,
    "description": string,
    "passingScore": 70,
    "questions": [ { "question": string, "explanation": string, "options": [ {"text": string, "isCorrect": boolean } ] } ]
  }
}`;
}

function lessonContent(title: string, objective: string, steps: string[]): string {
  return [
    `## Learning objective`,
    ``,
    objective,
    ``,
    `## Overview`,
    ``,
    `This lesson covers **${title}** for Maxpro Academy learners.`,
    ``,
    ...steps.flatMap((step, index) => [
      `## Step ${index + 1}`,
      ``,
      step,
      ``,
    ]),
    `## Key takeaways`,
    ``,
    `- Watch the lesson video carefully`,
    `- Practice the key points before moving on`,
    `- Use this lesson as a field reference when needed`,
  ].join("\n");
}

function cleanLessonTitle(title: string): string {
  return title
    .replace(/\s*\|\s*Chapter.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function selectQuizTopics(titles: string[], count: number): string[] {
  if (count <= 0) return [];
  if (titles.length === 0) {
    return Array.from({ length: count }, () => "this course");
  }
  if (titles.length === count) return titles;
  if (titles.length > count) {
    return Array.from({ length: count }, (_, index) => {
      const sourceIndex =
        count === 1
          ? 0
          : Math.round((index * (titles.length - 1)) / (count - 1));
      return titles[sourceIndex] ?? titles[0];
    });
  }

  return Array.from(
    { length: count },
    (_, index) => titles[index % titles.length] ?? titles[0],
  );
}

function buildCourseCoverageQuiz(
  lessonTitles: string[],
  topic: string,
  requestedCount: number,
) {
  const count = Math.min(
    15,
    Math.max(3, lessonTitles.length || requestedCount),
  );
  const topics = selectQuizTopics(lessonTitles, count);

  return topics.map((rawTitle) => {
    const title = cleanLessonTitle(rawTitle).slice(0, 80) || topic;
    return {
      question: `What is the main idea you should take from “${title}”?`,
      explanation: `Review the “${title}” lesson and apply that specific idea — this quiz covers the whole course.`,
      options: [
        {
          text: `Understand and apply the key idea from “${title}”`,
          isCorrect: true,
        },
        {
          text: `Skip “${title}” because later lessons replace it`,
          isCorrect: false,
        },
        {
          text: `Memorize formulas from “${title}” without understanding them`,
          isCorrect: false,
        },
        {
          text: `Ignore “${title}” unless it is mentioned again later`,
          isCorrect: false,
        },
      ],
    };
  });
}

function groupVideosIntoModules(
  videos: YoutubePlaylistVideo[],
  preferredModuleCount: number,
): YoutubePlaylistVideo[][] {
  if (videos.length === 0) return [];
  const moduleCount = Math.min(
    Math.max(1, preferredModuleCount),
    videos.length,
  );
  const size = Math.ceil(videos.length / moduleCount);
  const groups: YoutubePlaylistVideo[][] = [];
  for (let i = 0; i < videos.length; i += size) {
    groups.push(videos.slice(i, i + size));
  }
  return groups;
}

export function buildCourseFromPlaylistVideos(
  input: AiCourseGenerateInput & { productName: string },
  playlist: YoutubePlaylistResult,
): GeneratedCourseDraft {
  const videos = playlist.videos;
  const preferredTitle =
    input.courseTitle && input.courseTitle.trim().length > 0
      ? input.courseTitle.trim()
      : playlist.title || input.topic;
  const title = preferredTitle.slice(0, 200);
  const baseSlug = slugify(title).slice(0, 80) || "youtube-course";
  const groups = groupVideosIntoModules(videos, input.moduleCount || 3);

  const modules = groups.map((group, moduleIndex) => {
    const moduleNumber = moduleIndex + 1;
    return {
      title:
        groups.length === 1
          ? "Course videos"
          : `Module ${moduleNumber}`,
      description: `Lessons ${moduleIndex * group.length + 1}–${
        moduleIndex * group.length + group.length
      } from the playlist.`,
      lessons: group.map((video, lessonIndex) => {
        const lessonTitle = video.title.slice(0, 200) || `Lesson ${lessonIndex + 1}`;
        const objective = `Learn the key ideas from “${lessonTitle}” and apply them in practice.`;
        const minutes = video.durationSeconds
          ? Math.max(5, Math.round(video.durationSeconds / 60))
          : 10;

        return {
          title: lessonTitle,
          slug: slugify(`${baseSlug}-${video.videoId}`).slice(0, 120),
          description: `Watch and apply: ${lessonTitle}`,
          learningObjective: objective,
          estimatedMinutes: Math.min(120, minutes),
          youtubeVideoId: video.videoId,
          writtenContent: lessonContent(lessonTitle, objective, [
            `Watch the embedded video for this lesson (${video.videoId}).`,
            `Note the main points and how they apply to your day-to-day work.`,
            `Practice one action from the video before continuing.`,
          ]),
        };
      }),
    };
  });

  const questions = buildCourseCoverageQuiz(
    videos.map((video) => video.title),
    input.topic,
    input.quizQuestionCount || 5,
  );

  const estimatedMinutes = modules.reduce(
    (sum, courseModule) =>
      sum +
      courseModule.lessons.reduce(
        (lessonSum, lesson) => lessonSum + lesson.estimatedMinutes,
        0,
      ),
    0,
  );

  return generatedCourseDraftSchema.parse({
    title,
    slug: baseSlug,
    shortDescription: `A video-based training path covering ${input.topic}.`,
    description: `This Maxpro Academy course is built from ${videos.length} YouTube video${
      videos.length === 1 ? "" : "s"
    }${playlist.title ? ` in “${playlist.title}”` : ""}. Each lesson includes the matching video plus a written walkthrough. Finish with a final quiz covering the whole course.`,
    level: "beginner",
    estimatedMinutes: Math.max(30, estimatedMinutes),
    learningOutcomes: [
      `Explain the core ideas covered in ${input.topic}`,
      `Apply techniques demonstrated in the course videos`,
      `Avoid common mistakes called out in the lessons`,
      `Pass a knowledge check on the key concepts`,
    ],
    modules,
    quiz: {
      title: `${title} — Final Knowledge Check`,
      description: `${questions.length} questions covering every lesson. Passing score: 70%.`,
      passingScore: 70,
      questions,
    },
  });
}

export function buildFallbackCourseDraft(
  input: AiCourseGenerateInput & { productName: string },
  playlist?: YoutubePlaylistResult | null,
): GeneratedCourseDraft {
  if (playlist && playlist.videos.length > 0) {
    return buildCourseFromPlaylistVideos(input, playlist);
  }

  const preferredTitle =
    input.courseTitle && input.courseTitle.trim().length > 0
      ? input.courseTitle.trim()
      : null;
  const title = (preferredTitle ?? `${input.topic}`).slice(0, 200);
  const baseSlug = slugify(title).slice(0, 80) || "ai-generated-course";
  const moduleCount = input.moduleCount;
  const lessonsPerModule = input.lessonsPerModule;
  const quizCount = input.quizQuestionCount;

  const modules = Array.from({ length: moduleCount }, (_, moduleIndex) => {
    const moduleNumber = moduleIndex + 1;
    const moduleTitle =
      moduleIndex === 0
        ? "Getting Started"
        : moduleIndex === moduleCount - 1
          ? "Practice & Review"
          : `Core Skills ${moduleNumber}`;

    const lessons = Array.from({ length: lessonsPerModule }, (_, lessonIndex) => {
      const lessonNumber = lessonIndex + 1;
      const lessonTitle =
        moduleIndex === 0 && lessonIndex === 0
          ? `Introduction to ${input.topic}`
          : `${moduleTitle} — Lesson ${lessonNumber}`;
      const objective = `Learn how to apply ${input.topic} in practical day-to-day work.`;

      return {
        title: lessonTitle,
        slug: slugify(`${baseSlug}-m${moduleNumber}-l${lessonNumber}`),
        description: `Practical guidance for ${lessonTitle.toLowerCase()}.`,
        learningObjective: objective,
        estimatedMinutes: 8 + lessonIndex * 2,
        writtenContent: lessonContent(lessonTitle, objective, [
          `Review the learning goal for ${input.topic}.`,
          `Practice the key steps described in this lesson.`,
          `Confirm you can apply the skill before moving to the next lesson.`,
        ]),
      };
    });

    return {
      title: moduleTitle,
      description: `Module ${moduleNumber} for ${input.topic}.`,
      lessons,
    };
  });

  const questions = buildCourseCoverageQuiz(
    modules.flatMap((courseModule) =>
      courseModule.lessons.map((lesson) => lesson.title),
    ),
    input.topic,
    quizCount,
  );

  const estimatedMinutes = modules.reduce(
    (sum, courseModule) =>
      sum +
      courseModule.lessons.reduce(
        (lessonSum, lesson) => lessonSum + lesson.estimatedMinutes,
        0,
      ),
    0,
  );

  return generatedCourseDraftSchema.parse({
    title,
    slug: baseSlug,
    shortDescription: `A practical training path covering ${input.topic}.`,
    description: `This Maxpro Academy course helps ${
      input.audience || "learners"
    } understand ${input.topic}. Lessons use written walkthroughs. Finish with a final quiz covering the whole course.`,
    level: "beginner",
    estimatedMinutes: Math.max(30, estimatedMinutes),
    learningOutcomes: [
      `Explain the purpose of ${input.topic}`,
      `Complete the core practice steps confidently`,
      `Avoid common mistakes during day-to-day use`,
      `Pass a knowledge check on the key concepts`,
    ],
    modules,
    quiz: {
      title: `${title} — Final Knowledge Check`,
      description: `${questions.length} questions covering every lesson. Passing score: 70%.`,
      passingScore: 70,
      questions,
    },
  });
}

export function attachPlaylistVideosToDraft(
  draft: GeneratedCourseDraft,
  videos: YoutubePlaylistVideo[],
): GeneratedCourseDraft {
  if (videos.length === 0) return draft;

  const flatLessons = draft.modules.flatMap((courseModule) => courseModule.lessons);

  // If lesson count matches, map 1:1 in order
  if (flatLessons.length === videos.length) {
    let i = 0;
    const modules = draft.modules.map((courseModule) => ({
      ...courseModule,
      lessons: courseModule.lessons.map((lesson) => {
        const video = videos[i];
        i += 1;
        return {
          ...lesson,
          youtubeVideoId: lesson.youtubeVideoId || video.videoId,
          title: lesson.title || video.title,
        };
      }),
    }));
    return generatedCourseDraftSchema.parse({ ...draft, modules });
  }

  // Prefer rebuilding from playlist for correct video coverage
  return draft;
}

function repairDraft(
  parsed: unknown,
  videos: YoutubePlaylistVideo[] = [],
): GeneratedCourseDraft {
  const candidate = parsed as Partial<GeneratedCourseDraft> & {
    modules?: Array<
      Partial<GeneratedCourseDraft["modules"][number]> & {
        lessons?: Array<
          Partial<GeneratedCourseDraft["modules"][number]["lessons"][number]> & {
            youtubeVideoId?: string | null;
          }
        >;
      }
    >;
    quiz?: Partial<GeneratedCourseDraft["quiz"]> & {
      questions?: Array<
        Partial<GeneratedCourseDraft["quiz"]["questions"][number]> & {
          options?: Array<
            Partial<GeneratedCourseDraft["quiz"]["questions"][number]["options"][number]>
          >;
        }
      >;
    };
  };

  const title = String(candidate.title ?? "AI Generated Course").trim();
  let videoCursor = 0;

  const repaired: GeneratedCourseDraft = {
    title,
    slug: slugify(String(candidate.slug || title)),
    shortDescription: String(
      candidate.shortDescription ??
        "AI-generated Maxpro Academy course draft ready for review.",
    ),
    description: String(
      candidate.description ??
        "This course was drafted by local AI and should be reviewed before publishing.",
    ),
    level:
      candidate.level === "intermediate" || candidate.level === "advanced"
        ? candidate.level
        : "beginner",
    estimatedMinutes: Number(candidate.estimatedMinutes ?? 60),
    learningOutcomes:
      candidate.learningOutcomes && candidate.learningOutcomes.length >= 3
        ? candidate.learningOutcomes.map(String)
        : [
            "Understand the core workflow",
            "Complete key tasks in the product",
            "Pass the knowledge check",
          ],
    modules: (candidate.modules ?? []).map((courseModule, moduleIndex) => ({
      title: String(courseModule.title ?? `Module ${moduleIndex + 1}`),
      description: String(
        courseModule.description ?? `Training module ${moduleIndex + 1}`,
      ),
      lessons: (courseModule.lessons ?? []).map((lesson, lessonIndex) => {
        const lessonTitle = String(
          lesson.title ?? `Lesson ${lessonIndex + 1}`,
        );
        const fromModel =
          typeof lesson.youtubeVideoId === "string" &&
          /^[\w-]{11}$/.test(lesson.youtubeVideoId)
            ? lesson.youtubeVideoId
            : null;
        const fromPlaylist = videos[videoCursor]?.videoId ?? null;
        if (fromPlaylist) videoCursor += 1;

        return {
          title: lessonTitle,
          slug: slugify(String(lesson.slug || lessonTitle)),
          description: String(
            lesson.description ?? `Lesson covering ${lessonTitle}`,
          ),
          learningObjective: String(
            lesson.learningObjective ?? `Learn ${lessonTitle}`,
          ),
          estimatedMinutes: Number(lesson.estimatedMinutes ?? 10),
          youtubeVideoId: fromModel || fromPlaylist,
          writtenContent: String(
            lesson.writtenContent ??
              lessonContent(lessonTitle, `Learn ${lessonTitle}`, [
                "Watch the lesson video if available.",
                "Complete the required practice for this topic.",
                "Review and confirm before finishing.",
              ]),
          ),
        };
      }),
    })),
    quiz: {
      title: String(candidate.quiz?.title ?? "Final Knowledge Check"),
      description: String(
        candidate.quiz?.description ??
          "Confirm understanding before earning a certificate.",
      ),
      passingScore: Number(candidate.quiz?.passingScore ?? 70),
      questions: (candidate.quiz?.questions ?? []).map((question, qIndex) => {
        const options = (question.options ?? []).map((option, oIndex) => ({
          text: String(option.text ?? `Option ${oIndex + 1}`),
          isCorrect: Boolean(option.isCorrect),
        }));

        if (!options.some((option) => option.isCorrect) && options[0]) {
          options[0].isCorrect = true;
        }

        while (options.length < 2) {
          options.push({
            text: `Additional option ${options.length + 1}`,
            isCorrect: false,
          });
        }

        const correctCount = options.filter((option) => option.isCorrect).length;
        if (correctCount !== 1) {
          options.forEach((option, index) => {
            option.isCorrect = index === 0;
          });
        }

        return {
          question: String(
            question.question ?? `Knowledge check question ${qIndex + 1}`,
          ),
          explanation: String(
            question.explanation ??
              "Review the lesson walkthrough and try again if needed.",
          ),
          options,
        };
      }),
    },
  };

  if (repaired.modules.length === 0) {
    throw new Error("AI draft contained no modules");
  }

  if (repaired.quiz.questions.length < 3) {
    throw new Error("AI draft contained fewer than 3 quiz questions");
  }

  let draft = generatedCourseDraftSchema.parse(repaired);

  // If playlist videos exist but AI missed coverage, rebuild from playlist
  const attached = draft.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.youtubeVideoId).length;

  if (videos.length > 0 && attached < videos.length) {
    // Prefer authoritative playlist mapping for video lessons
    return buildCourseFromPlaylistVideos(
      {
        productId: "",
        productName: "Maxpro Academy",
        topic: draft.title,
        courseTitle: draft.title,
        moduleCount: Math.min(4, Math.max(2, Math.ceil(videos.length / 4))),
        lessonsPerModule: 4,
        quizQuestionCount: draft.quiz.questions.length,
      },
      {
        playlistId: null,
        title: draft.title,
        videos,
        source: "playlist",
      },
    );
  }

  return attachPlaylistVideosToDraft(draft, videos);
}

export async function generateCourseDraft(input: {
  request: AiCourseGenerateInput;
  productName: string;
  productDescription?: string | null;
}): Promise<CourseGenerationResult> {
  const playlist =
    input.request.youtubeUrl && input.request.youtubeUrl.length > 0
      ? await resolveYoutubeSource(input.request.youtubeUrl)
      : null;

  const youtubeContext = playlist
    ? formatPlaylistForPrompt(playlist)
    : null;

  // Playlist/video-first: always materialize lessons from videos when available
  if (playlist && playlist.videos.length > 0) {
    const draft = buildCourseFromPlaylistVideos(
      {
        ...input.request,
        productName: input.productName,
      },
      playlist,
    );

    // Optionally polish with Ollama later; for reliability, playlist mapping is source of truth
    if (input.request.useFallback) {
      return {
        draft,
        provider: "fallback",
        model: "playlist-mapper",
        warning: `Mapped ${playlist.videos.length} YouTube video${
          playlist.videos.length === 1 ? "" : "s"
        } to lessons (template mode).`,
        youtube: playlist,
      };
    }

    const status = await getLocalAiStatus();
    if (!status.available || !status.models.length) {
      return {
        draft,
        provider: "fallback",
        model: "playlist-mapper",
        warning: `Mapped ${playlist.videos.length} playlist videos to lessons. Local AI unavailable for extra polish — videos are attached.`,
        youtube: playlist,
      };
    }

    const preferred =
      input.request.model ||
      process.env.OLLAMA_MODEL ||
      status.models[0]?.name;

    try {
      const result = await generateLocalJson({
        model: preferred!,
        system: buildSystemPrompt(true),
        prompt: buildUserPrompt({
          ...input.request,
          productName: input.productName,
          productDescription: input.productDescription,
          youtubeContext,
          videoCount: playlist.videos.length,
        }),
      });

      const polished = repairDraft(result.parsed, playlist.videos);
      return {
        draft: polished,
        provider: "ollama",
        model: result.model,
        warning: `Course built from ${playlist.videos.length} YouTube videos with local AI polish.`,
        youtube: playlist,
      };
    } catch (error) {
      return {
        draft,
        provider: "fallback",
        model: "playlist-mapper",
        warning: `Playlist videos mapped to lessons. AI polish failed (${
          error instanceof Error ? error.message : "unknown error"
        }).`,
        youtube: playlist,
      };
    }
  }

  if (input.request.useFallback) {
    return {
      draft: buildFallbackCourseDraft({
        ...input.request,
        productName: input.productName,
      }),
      provider: "fallback",
      model: "template-fallback",
      warning:
        "Used the built-in template generator (fallback mode requested).",
      youtube: playlist ?? undefined,
    };
  }

  const status = await getLocalAiStatus();
  if (!status.available) {
    return {
      draft: buildFallbackCourseDraft({
        ...input.request,
        productName: input.productName,
      }),
      provider: "fallback",
      model: "template-fallback",
      warning: `Local AI unavailable (${status.error ?? "not running"}). Generated a structured draft with the template engine.`,
      youtube: playlist ?? undefined,
    };
  }

  const preferred =
    input.request.model ||
    process.env.OLLAMA_MODEL ||
    status.models[0]?.name;

  if (!preferred) {
    return {
      draft: buildFallbackCourseDraft({
        ...input.request,
        productName: input.productName,
      }),
      provider: "fallback",
      model: "template-fallback",
      warning:
        "No local models found. Pull a model with `ollama pull llama3.2`, then retry.",
      youtube: playlist ?? undefined,
    };
  }

  try {
    const result = await generateLocalJson({
      model: preferred,
      system: buildSystemPrompt(false),
      prompt: buildUserPrompt({
        ...input.request,
        productName: input.productName,
        productDescription: input.productDescription,
        youtubeContext,
      }),
    });

    return {
      draft: repairDraft(result.parsed, playlist?.videos ?? []),
      provider: "ollama",
      model: result.model,
      youtube: playlist ?? undefined,
    };
  } catch (error) {
    return {
      draft: buildFallbackCourseDraft({
        ...input.request,
        productName: input.productName,
      }),
      provider: "fallback",
      model: "template-fallback",
      warning: `Local AI generation failed (${
        error instanceof Error ? error.message : "unknown error"
      }). Delivered a template draft instead.`,
      youtube: playlist ?? undefined,
    };
  }
}
