/**
 * Rockey field-sales tutorial course from local MP4s in public/Videos/Tutorial Videos/Rockey.
 * Single internal module; course UI renders a flat lesson list (no module chrome).
 */

import type { Course, Lesson, Module } from "@/types/database";
import { slugify } from "@/lib/utils";

const TIMESTAMP = "2026-09-22T08:00:00.000Z";

export const ROCKEY_TUTORIAL_VIDEOS_COURSE_ID =
  "22222222-2222-2222-2222-222222222205";

/** Must not collide with mvp-fundamentals Knowledge Check module 333…308. */
export const ROCKEY_TUTORIAL_VIDEOS_MODULE_ID =
  "33333333-3333-3333-3333-333333333398";

function rockeyTutorialVideoUrl(fileName: string): string {
  return `/Videos/${encodeURIComponent("Tutorial Videos")}/${encodeURIComponent("Rockey")}/${encodeURIComponent(fileName)}`;
}

interface TutorialVideoLesson {
  fileName: string;
  title: string;
  durationSeconds: number;
  learningObjective: string;
  writtenContent: string;
  sortOrder: number;
}

/** Field-rep day order: sign in → navigate → customers → visits → orders → sync → close day → troubleshooting. */
const TUTORIAL_VIDEOS: TutorialVideoLesson[] = [
  {
    fileName: "Login & Mark Attendance Rockey.mp4",
    title: "Login & Mark Attendance Rockey",
    durationSeconds: 69,
    sortOrder: 1,
    learningObjective:
      "Sign in to Rockey and mark attendance at the start of your field day.",
    writtenContent:
      "## Overview\n\nWatch how to log in to Rockey and mark attendance so your day is recorded correctly for reporting and compliance.\n\n## When to use this\n\nAt the beginning of every field day, before customer visits or order entry.",
  },
  {
    fileName: "Navigating Dashboard Gelx Rockey.mp4",
    title: "Navigating Dashboard Gelx Rockey",
    durationSeconds: 112,
    sortOrder: 2,
    learningObjective:
      "Find the main areas of the Gelx Rockey home dashboard and move between them confidently.",
    writtenContent:
      "## Overview\n\nA walkthrough of the Gelx Rockey dashboard: summary areas, navigation, and where to start common tasks.\n\n## Tip\n\nPause the video on each screen and locate the same menu on your device before moving on.",
  },
  {
    fileName: "Tagging a Customer Gelx Rockey.mp4",
    title: "Tagging a Customer Gelx Rockey",
    durationSeconds: 99,
    sortOrder: 3,
    learningObjective:
      "Tag or classify a customer in Rockey for routing, reporting, or visit planning.",
    writtenContent:
      "## Overview\n\nLearn how to tag a customer in Gelx Rockey so your visits and orders stay organized.\n\n## Practice\n\nAfter watching, tag a test customer on your route (or in training) and confirm the tag appears on the customer record.",
  },
  {
    fileName: "How to conduct an offsite visit Deluxefood.mp4",
    title: "How to conduct an offsite visit Deluxefood",
    durationSeconds: 40,
    sortOrder: 4,
    learningObjective:
      "Complete an offsite customer visit workflow in the Deluxe Food deployment.",
    writtenContent:
      "## Overview\n\nStep-by-step guidance for conducting an offsite visit using the Deluxe Food configuration of Rockey.\n\n## Note\n\nOffsite visits may differ slightly by deployment; follow your supervisor’s route plan alongside this tutorial.",
  },
  {
    fileName: "Placing an Order Gelx Rockey.mp4",
    title: "Placing an Order Gelx Rockey",
    durationSeconds: 78,
    sortOrder: 5,
    learningObjective:
      "Create and submit a sales order in Gelx Rockey from the field.",
    writtenContent:
      "## Overview\n\nFrom customer selection through line items to submission — how to place an order in Gelx Rockey.\n\n## Before you submit\n\nVerify quantities, pricing, and delivery details match what the customer confirmed.",
  },
  {
    fileName: "How to share an order with the customer Deluxefood.mp4",
    title: "How to share an order with the customer Deluxefood",
    durationSeconds: 30,
    sortOrder: 6,
    learningObjective:
      "Share order details with the customer after placement in the Deluxe Food app.",
    writtenContent:
      "## Overview\n\nShows how to share an order with the customer so they can review or confirm what was captured in Rockey.\n\n## Customer experience\n\nUse this when the customer needs a copy or confirmation link immediately after the visit.",
  },
  {
    fileName: "Uploading Offline Data Gelx Rockey.mp4",
    title: "Uploading Offline Data Gelx Rockey",
    durationSeconds: 65,
    sortOrder: 7,
    learningObjective:
      "Sync offline visits and orders to the server when connectivity returns.",
    writtenContent:
      "## Overview\n\nWhen you work without signal, Rockey stores data locally. This video covers uploading offline data when you are back online.\n\n## Best practice\n\nUpload before end of day so back-office teams see today’s activity in reports.",
  },
  {
    fileName: "End Day Gelx Rockey.mp4",
    title: "End Day Gelx Rockey",
    durationSeconds: 52,
    sortOrder: 8,
    learningObjective:
      "Close your field day in Gelx Rockey and complete end-of-day steps.",
    writtenContent:
      "## Overview\n\nHow to end your day in Gelx Rockey — final checks, sync, and sign-off so your attendance and activity are complete.\n\n## End of route\n\nRun this after your last visit and offline upload.",
  },
  {
    fileName: "Force Stop App Gelx Rockey.mp4",
    title: "Force Stop App Gelx Rockey",
    durationSeconds: 32,
    sortOrder: 9,
    learningObjective:
      "Safely force-stop the Gelx Rockey app when it is stuck or unresponsive.",
    writtenContent:
      "## Overview\n\nTroubleshooting steps to force-stop Gelx Rockey on the device and reopen a clean session.\n\n## When to use\n\nOnly when the app freezes or will not respond — not for normal logout. Contact Maxpro Support if problems repeat after restart.",
  },
];

const totalDurationSeconds = TUTORIAL_VIDEOS.reduce(
  (sum, item) => sum + item.durationSeconds,
  0,
);

export const rockeyTutorialVideosCourse: Course = {
  id: ROCKEY_TUTORIAL_VIDEOS_COURSE_ID,
  product_id: "11111111-1111-1111-1111-111111111101",
  title: "Rockey Field Sales Video Tutorials",
  slug: "rockey-field-sales-video-tutorials",
  description:
    "Nine short screen recordings for Rockey field reps using Gelx Rockey and Deluxe Food workflows. Follow a full day in order: login and attendance, dashboard navigation, customer tagging, offsite visits, placing and sharing orders, offline sync, end of day, and force-stop troubleshooting. Lesson titles match the tutorial videos exactly.",
  short_description:
    "Watch-and-learn Rockey tutorials for daily field sales workflows.",
  thumbnail_url: "/products/rockey/cover.png",
  level: "beginner",
  estimated_minutes: Math.max(1, Math.ceil(totalDurationSeconds / 60)),
  published: true,
  featured: true,
  certificate_enabled: false,
  sort_order: 4,
  learning_outcomes: [
    "Start and end a field day in Rockey with attendance and end-day steps",
    "Navigate the Gelx Rockey dashboard",
    "Tag customers and conduct offsite visits",
    "Place orders and share them with customers",
    "Upload offline data when back online",
    "Recover from a frozen app using force stop",
  ],
  status: "published",
  version: "1.0",
  last_reviewed_at: TIMESTAMP,
  review_status: "current",
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
};

export const rockeyTutorialVideosModule: Module = {
  id: ROCKEY_TUTORIAL_VIDEOS_MODULE_ID,
  course_id: ROCKEY_TUTORIAL_VIDEOS_COURSE_ID,
  title: "Tutorial videos",
  description: "All Rockey field tutorial recordings in recommended watch order.",
  sort_order: 1,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
};

const LESSON_ID_BASE = "44444444-4444-4444-4444-44444444445";

export const rockeyTutorialVideosLessons: Lesson[] = TUTORIAL_VIDEOS.map(
  (item, index) => {
    const lessonId = `${LESSON_ID_BASE}${String(index + 1).padStart(1, "0")}`;
    return {
      id: lessonId,
      module_id: ROCKEY_TUTORIAL_VIDEOS_MODULE_ID,
      title: item.title,
      slug: slugify(item.title),
      description: item.learningObjective,
      learning_objective: item.learningObjective,
      video_provider: "external",
      video_id: null,
      video_url: rockeyTutorialVideoUrl(item.fileName),
      duration_seconds: item.durationSeconds,
      thumbnail_url: "/products/rockey/cover.png",
      transcript: null,
      written_content: item.writtenContent,
      captions_url: null,
      processing_status: "ready",
      published: true,
      required: true,
      sort_order: item.sortOrder,
      version: "1.0",
      last_reviewed_at: TIMESTAMP,
      review_status: "current",
      created_at: TIMESTAMP,
      updated_at: TIMESTAMP,
    };
  },
);
