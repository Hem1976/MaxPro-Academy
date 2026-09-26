/**
 * RocketSales Pharma tutorial course from local MP4s in
 * public/Videos/Tutorial Videos/RocketSales.
 */

import type {
  Course,
  Lesson,
  Module,
  Quiz,
  QuizOption,
  QuizQuestion,
} from "@/types/database";
import { slugify } from "@/lib/utils";

const TIMESTAMP = "2026-09-22T10:45:00.000Z";

export const ROCKETSALES_PHARMA_TUTORIAL_VIDEOS_COURSE_ID =
  "22222222-2222-2222-2222-222222222206";

export const ROCKETSALES_PHARMA_TUTORIAL_VIDEOS_MODULE_ID =
  "33333333-3333-3333-3333-333333333399";

function rocketsalesTutorialVideoUrl(fileName: string): string {
  return `/Videos/${encodeURIComponent("Tutorial Videos")}/${encodeURIComponent("RocketSales")}/${encodeURIComponent(fileName)}`;
}

interface TutorialVideoLesson {
  fileName: string;
  /** Lesson title matches the video file name (without extension). */
  title: string;
  durationSeconds: number;
  sortOrder: number;
  learningObjective: string;
}

/** Recommended watch order: login → navigate → tagging → detailing → orders → proforma → reports → office reporting. */
const TUTORIAL_VIDEOS: TutorialVideoLesson[] = [
  {
    fileName: "KAS - How to Login.mp4",
    title: "KAS - How to Login",
    durationSeconds: 86,
    sortOrder: 1,
    learningObjective:
      "Sign in to RocketSales Pharma (KAS) with your field credentials.",
  },
  {
    fileName: "KAS - How to Navigate Doctor's Section.mp4",
    title: "KAS - How to Navigate Doctor's Section",
    durationSeconds: 67,
    sortOrder: 2,
    learningObjective:
      "Open and move through the Doctors area for call planning and detailing.",
  },
  {
    fileName: "KAS - How to Navigate Customer's Section.mp4",
    title: "KAS - How to Navigate Customer's Section",
    durationSeconds: 108,
    sortOrder: 3,
    learningObjective:
      "Find customers, accounts, and related records in the Customers section.",
  },
  {
    fileName: "KAS - How to Multitag a Doctor.mp4",
    title: "KAS - How to Multitag a Doctor",
    durationSeconds: 66,
    sortOrder: 4,
    learningObjective:
      "Apply multiple tags to a doctor for segmentation and reporting.",
  },
  {
    fileName: "KAS - How to Tag a Customer.mp4",
    title: "KAS - How to Tag a Customer",
    durationSeconds: 80,
    sortOrder: 5,
    learningObjective: "Tag a customer for routing, campaigns, or compliance.",
  },
  {
    fileName: "KAS - How to do Detailing.mp4",
    title: "KAS - How to do Detailing",
    durationSeconds: 43,
    sortOrder: 6,
    learningObjective:
      "Run a pharma detailing call and capture visit activity in the app.",
  },
  {
    fileName: "KAS - How to Place Orders.mp4",
    title: "KAS - How to Place Orders",
    durationSeconds: 95,
    sortOrder: 7,
    learningObjective: "Create and submit standard sales orders in the field.",
  },
  {
    fileName: "KAS - How to Place Quotation Orders.mp4",
    title: "KAS - How to Place Quotation Orders",
    durationSeconds: 64,
    sortOrder: 8,
    learningObjective:
      "Build and submit quotation orders when pricing must be confirmed first.",
  },
  {
    fileName: "KAS - How to share Proforma Invoice via the app (Image).mp4",
    title: "KAS - How to share Proforma Invoice via the app (Image)",
    durationSeconds: 33,
    sortOrder: 9,
    learningObjective:
      "Share a proforma invoice with the customer as an image from the app.",
  },
  {
    fileName: "KAS - How to share Proforma Invoice via the app (PDF).mp4",
    title: "KAS - How to share Proforma Invoice via the app (PDF)",
    durationSeconds: 33,
    sortOrder: 10,
    learningObjective:
      "Share a proforma invoice as a PDF attachment from RocketSales Pharma.",
  },
  {
    fileName: "KAS - How to share Proforma Invoice via the app (WhatsApp Text).mp4",
    title:
      "KAS - How to share Proforma Invoice via the app (WhatsApp Text)",
    durationSeconds: 30,
    sortOrder: 11,
    learningObjective:
      "Send proforma invoice details to the customer via WhatsApp text.",
  },
  {
    fileName: "KAS - How to View Reports.mp4",
    title: "KAS - How to View Reports",
    durationSeconds: 59,
    sortOrder: 12,
    learningObjective:
      "Open field reports for visits, orders, and productivity in the app.",
  },
  {
    fileName: "KAS -  How to Report from the Office.mp4",
    title: "KAS -  How to Report from the Office",
    durationSeconds: 56,
    sortOrder: 13,
    learningObjective:
      "Submit or review office-based reporting workflows in RocketSales Pharma.",
  },
];

const totalDurationSeconds = TUTORIAL_VIDEOS.reduce(
  (sum, item) => sum + item.durationSeconds,
  0,
);

export const rocketsalesPharmaTutorialVideosCourse: Course = {
  id: ROCKETSALES_PHARMA_TUTORIAL_VIDEOS_COURSE_ID,
  product_id: "11111111-1111-1111-1111-111111111103",
  title: "RocketSales Pharma Video Tutorials",
  slug: "rocketsales-pharma-video-tutorials",
  description:
    "Thirteen KAS screen recordings for RocketSales Pharma medical reps and field teams. Watch in order: login, Doctors and Customers navigation, multitagging and tagging, detailing, orders and quotation orders, sharing proforma invoices (image, PDF, WhatsApp), field reports, and office reporting. Lesson titles match the tutorial video names.",
  short_description:
    "Video walkthroughs for RocketSales Pharma daily field workflows.",
  thumbnail_url: "/products/rocketsales-pharma/cover.png",
  level: "beginner",
  estimated_minutes: Math.max(1, Math.ceil(totalDurationSeconds / 60)),
  published: true,
  featured: true,
  certificate_enabled: true,
  sort_order: 5,
  learning_outcomes: [
    "Log in and navigate Doctors and Customers in RocketSales Pharma",
    "Tag doctors and customers and run detailing visits",
    "Place standard and quotation orders in the field",
    "Share proforma invoices by image, PDF, and WhatsApp",
    "View field reports and complete office reporting",
  ],
  status: "published",
  version: "1.0",
  last_reviewed_at: TIMESTAMP,
  review_status: "current",
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
};

export const rocketsalesPharmaTutorialVideosModule: Module = {
  id: ROCKETSALES_PHARMA_TUTORIAL_VIDEOS_MODULE_ID,
  course_id: ROCKETSALES_PHARMA_TUTORIAL_VIDEOS_COURSE_ID,
  title: "Tutorial videos",
  description:
    "All RocketSales Pharma (KAS) tutorial recordings in recommended watch order.",
  sort_order: 1,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
};

const LESSON_ID_PREFIX = "44444444-4444-4444-4444-4444444460";

export const rocketsalesPharmaTutorialVideosLessons: Lesson[] =
  TUTORIAL_VIDEOS.map((item, index) => {
    const lessonId = `${LESSON_ID_PREFIX}${String(index + 1).padStart(2, "0")}`;
    return {
      id: lessonId,
      module_id: ROCKETSALES_PHARMA_TUTORIAL_VIDEOS_MODULE_ID,
      title: item.title,
      slug: slugify(item.title),
      description: item.learningObjective,
      learning_objective: item.learningObjective,
      video_provider: "external",
      video_id: null,
      video_url: rocketsalesTutorialVideoUrl(item.fileName),
      duration_seconds: item.durationSeconds,
      thumbnail_url: "/products/rocketsales-pharma/cover.png",
      transcript: null,
      written_content: `## ${item.title}\n\n${item.learningObjective}\n\nWatch the tutorial video, then practice the same steps on your device or training environment.`,
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
  });

const ROCKETSALES_PHARMA_TUTORIAL_QUIZ_ID =
  "55555555-5555-5555-5555-555555555506";

const LAST_LESSON_ID = `${LESSON_ID_PREFIX}${String(13).padStart(2, "0")}`;

export const rocketsalesPharmaTutorialQuizzes: Quiz[] = [
  {
    id: ROCKETSALES_PHARMA_TUTORIAL_QUIZ_ID,
    lesson_id: LAST_LESSON_ID,
    title: "RocketSales Pharma Video Tutorials — Knowledge Check",
    description:
      "13 questions based on the tutorial videos. Passing score: 80%.",
    passing_score: 80,
    required: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];

function tutorialQuestion(
  index: number,
  question: string,
  explanation: string,
  correct: string,
  wrong: [string, string, string],
): { question: QuizQuestion; options: QuizOption[] } {
  const questionId = `66666666-6666-6666-6666-6666666670${String(index).padStart(2, "0")}`;
  const optionBase = 0x710 + (index - 1) * 4;
  const texts = [
    { option_text: correct, is_correct: true },
    ...wrong.map((option_text) => ({ option_text, is_correct: false })),
  ];
  const rotateBy = (index - 1) % texts.length;
  const rotated = [...texts.slice(rotateBy), ...texts.slice(0, rotateBy)];

  return {
    question: {
      id: questionId,
      quiz_id: ROCKETSALES_PHARMA_TUTORIAL_QUIZ_ID,
      question,
      explanation,
      sort_order: index,
      created_at: TIMESTAMP,
    },
    options: rotated.map((option, optionIndex) => ({
      id: `77777777-7777-7777-7777-77777777${(optionBase + optionIndex + 1).toString(16)}`,
      question_id: questionId,
      option_text: option.option_text,
      is_correct: option.is_correct,
      sort_order: optionIndex + 1,
    })),
  };
}

const quizItems = [
  tutorialQuestion(
    1,
    "Which tutorial covers signing in to RocketSales Pharma (KAS)?",
    "See “KAS - How to Login”.",
    "KAS - How to Login",
    [
      "KAS - How to View Reports",
      "KAS - How to Place Quotation Orders",
      "KAS - How to do Detailing",
    ],
  ),
  tutorialQuestion(
    2,
    "Where should you go first to work with doctor records and detailing routes?",
    "“KAS - How to Navigate Doctor's Section” walks through the Doctors area.",
    "The Doctors section",
    [
      "Only the office reporting screen",
      "Proforma invoice sharing",
      "Quotation orders only",
    ],
  ),
  tutorialQuestion(
    3,
    "Which section is used to find customer accounts and related records?",
    "“KAS - How to Navigate Customer's Section” covers customer navigation.",
    "The Customers section",
    [
      "The login screen only",
      "Force-stop troubleshooting",
      "Offline sync settings",
    ],
  ),
  tutorialQuestion(
    4,
    "What does the multitag doctor tutorial teach?",
    "“KAS - How to Multitag a Doctor” shows applying multiple tags to one doctor.",
    "Applying more than one tag to a doctor",
    [
      "Deleting all doctor records",
      "Sharing proforma invoices only",
      "Placing quotation orders without customers",
    ],
  ),
  tutorialQuestion(
    5,
    "Which video shows how to tag a customer?",
    "The lesson title is “KAS - How to Tag a Customer”.",
    "KAS - How to Tag a Customer",
    [
      "KAS - How to Login",
      "KAS - How to share Proforma Invoice via the app (PDF)",
      "KAS -  How to Report from the Office",
    ],
  ),
  tutorialQuestion(
    6,
    "What workflow does the detailing tutorial cover?",
    "“KAS - How to do Detailing” covers running a pharma detailing visit.",
    "Conducting a detailing call and capturing the visit",
    [
      "End-of-day force stop",
      "Uploading offline Rockey data",
      "Creating a new product catalog",
    ],
  ),
  tutorialQuestion(
    7,
    "Which tutorial should you watch to place a standard sales order?",
    "“KAS - How to Place Orders”.",
    "KAS - How to Place Orders",
    [
      "KAS - How to Multitag a Doctor",
      "KAS - How to View Reports",
      "KAS - How to Navigate Doctor's Section",
    ],
  ),
  tutorialQuestion(
    8,
    "When do you use quotation orders instead of a standard order?",
    "“KAS - How to Place Quotation Orders” — when pricing or confirmation is needed first.",
    "When a quotation must be created before the order is confirmed",
    [
      "Only when logging in from the office",
      "When sharing proforma invoices as images",
      "When multitagging doctors",
    ],
  ),
  tutorialQuestion(
    9,
    "How can you share a proforma invoice as a picture from the app?",
    "Watch “KAS - How to share Proforma Invoice via the app (Image)”.",
    "Using the image sharing option in the proforma invoice flow",
    [
      "Only by printing from the office",
      "By force-stopping the app",
      "By tagging a customer twice",
    ],
  ),
  tutorialQuestion(
    10,
    "Which tutorial covers sending a proforma invoice as a PDF?",
    "“KAS - How to share Proforma Invoice via the app (PDF)”.",
    "KAS - How to share Proforma Invoice via the app (PDF)",
    [
      "KAS - How to Login",
      "KAS - How to do Detailing",
      "KAS - How to Multitag a Doctor",
    ],
  ),
  tutorialQuestion(
    11,
    "How can invoice details be shared via WhatsApp?",
    "“KAS - How to share Proforma Invoice via the app (WhatsApp Text)”.",
    "Using the WhatsApp text option in the proforma sharing flow",
    [
      "Only from desktop email",
      "By placing a quotation order",
      "By navigating the Doctors section",
    ],
  ),
  tutorialQuestion(
    12,
    "Which video explains opening field reports in the app?",
    "“KAS - How to View Reports”.",
    "KAS - How to View Reports",
    [
      "KAS - How to Place Orders",
      "KAS - How to Tag a Customer",
      "KAS - How to Login",
    ],
  ),
  tutorialQuestion(
    13,
    "What is the focus of the office reporting tutorial?",
    "“KAS -  How to Report from the Office” (note the video file name).",
    "Reporting workflows completed from the office",
    [
      "Multitagging doctors in the field",
      "Sharing proforma invoices as images only",
      "First-time login on a new device only",
    ],
  ),
];

export const rocketsalesPharmaTutorialQuizQuestions: QuizQuestion[] =
  quizItems.map((item) => item.question);

export const rocketsalesPharmaTutorialQuizOptions: QuizOption[] =
  quizItems.flatMap((item) => item.options);
