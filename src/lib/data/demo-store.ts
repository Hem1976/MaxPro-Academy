import { summarizeCourseProgress } from "@/lib/progress/calculate";
import {
  mvpAgroCourse,
  mvpExtraLessons,
  mvpExtraModules,
  mvpExtraQuizOptions,
  mvpExtraQuizQuestions,
  mvpExtraQuizzes,
} from "@/lib/data/mvp-fundamentals-seed";
import {
  PLAYLIST_TEST_COURSE_ID,
  playlistTestCourse,
  playlistTestLessons,
  playlistTestModules,
  playlistTestQuizOptions,
  playlistTestQuizQuestions,
  playlistTestQuizzes,
} from "@/lib/data/playlist-test-course-seed";
import {
  rockeyTutorialVideosCourse,
  rockeyTutorialVideosLessons,
  rockeyTutorialVideosModule,
} from "@/lib/data/rockey-tutorial-videos-seed";
import {
  rocketsalesPharmaTutorialQuizOptions,
  rocketsalesPharmaTutorialQuizQuestions,
  rocketsalesPharmaTutorialQuizzes,
  rocketsalesPharmaTutorialVideosCourse,
  rocketsalesPharmaTutorialVideosLessons,
  rocketsalesPharmaTutorialVideosModule,
} from "@/lib/data/rocketsales-pharma-tutorial-videos-seed";
import type {
  Announcement,
  Category,
  Certificate,
  Course,
  Enrollment,
  LearningRole,
  Lesson,
  LessonProgress,
  LessonResource,
  Module,
  Product,
  Quiz,
  QuizAttempt,
  QuizOption,
  QuizQuestion,
  Tag,
  UserRole,
} from "@/types/database";

const TIMESTAMP = "2024-01-01T00:00:00.000Z";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

const categories: Category[] = [
  {
    id: "cat-sales-field",
    name: "Sales & Field Operations",
    slug: "sales-field-operations",
    description: "Sales force automation and field productivity solutions",
  },
  {
    id: "cat-distribution",
    name: "Distribution & Logistics",
    slug: "distribution-logistics",
    description: "Van selling, order and delivery workflows",
  },
  {
    id: "cat-analytics",
    name: "Analytics & Intelligence",
    slug: "analytics-intelligence",
    description: "Business intelligence and reporting",
  },
  {
    id: "cat-workforce",
    name: "Workforce & Security",
    slug: "workforce-security",
    description: "Guarding and workforce operations",
  },
];

const tags: Tag[] = [
  { id: "tag-fundamentals", name: "Fundamentals", slug: "fundamentals" },
  { id: "tag-field-sales", name: "Field Sales", slug: "field-sales" },
  { id: "tag-orders", name: "Orders", slug: "orders" },
  { id: "tag-reporting", name: "Reporting", slug: "reporting" },
  { id: "tag-administration", name: "Administration", slug: "administration" },
];

const products: Product[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Rockey",
    slug: "rockey",
    short_description:
      "All-in-one sales app for field teams and any sales model.",
    description:
      "Rockey is Maxpro Infotech's comprehensive sales force automation solution for salesmen, merchandisers, distributors, and businesses with field teams. Training covers core navigation and common field workflows.",
    logo_url: "/products/rockey/logo.png",
    cover_image_url: "/products/rockey/cover.png",
    category: "Sales & Field Operations",
    published: true,
    featured: true,
    sort_order: 1,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "RocketSales",
    slug: "rocketsales",
    short_description:
      "Omni sales, productivity and reporting SFA app for field teams.",
    description:
      "RocketSales is an omni sales, productivity and reporting SFA application for salesmen, merchandisers, promoters, brand ambassadors, distributors, and other field entities.",
    logo_url: null,
    cover_image_url: null,
    category: "Sales & Field Operations",
    published: false,
    featured: false,
    sort_order: 99,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    name: "RocketSales Pharma",
    slug: "rocketsales-pharma",
    short_description:
      "Productivity and reporting for pharmaceutical field teams.",
    description:
      "RocketSales Pharma supports pharmaceutical distributors, manufacturers, surgical suppliers, and agro-chemical medical reps with productivity and reporting workflows.",
    logo_url: "/products/rocketsales-pharma/logo.png",
    cover_image_url: "/products/rocketsales-pharma/cover.png",
    category: "Sales & Field Operations",
    published: true,
    featured: true,
    sort_order: 3,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    name: "Rocket Order AI",
    slug: "rocket-order-ai",
    short_description:
      "AI-assisted order capture and export for ERP, Excel, PDF, and email.",
    description:
      "Rocket Order AI helps teams turn incoming orders into structured records for invoicing, inventory updates, and export to ERP, Excel, PDF, or email/SMS. Training content is managed in Admin.",
    logo_url: null,
    cover_image_url: "/products/rocket-order-ai/cover.png",
    category: "Distribution & Logistics",
    published: true,
    featured: true,
    sort_order: 4,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111109",
    name: "Rockey Agro",
    slug: "rockey-agro",
    short_description:
      "Complete all-in-one mobile solution for agronomists and field teams.",
    description:
      "Complete all-in-one mobile solution for agronomists and field teams, enabling activity tracking, field reporting, and real-time operational visibility.\n\nKey features:\n• Field activity planning and tracking\n• Farm and plot geo-mapping\n• Crop scouting and inspection logs\n• Pest and disease reporting\n• Input usage tracking\n• Farmer database management\n• Offline data capture with sync\n• Agronomy performance dashboard",
    logo_url: "/products/rockey-agro/logo.png",
    cover_image_url: "/products/rockey-agro/cover.png",
    category: "Sales & Field Operations",
    published: true,
    featured: true,
    sort_order: 5,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    name: "RocketVan",
    slug: "rocketvan",
    short_description: "Sales app for van sellers and motorcycle sellers.",
    description:
      "RocketVan covers the van-selling flow from stock request and receipt through selling and submission of stock and cash back to the main store. Course details are editable in Admin.",
    logo_url: null,
    cover_image_url: null,
    category: "Distribution & Logistics",
    published: false,
    featured: false,
    sort_order: 102,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    name: "RocketPulse",
    slug: "rocketpulse",
    short_description: "Fiscal document notifications via email and SMS.",
    description:
      "RocketPulse sends fiscal documents via email and SMS notifications when fiscal documents such as invoices or credit/debit notes are printed.",
    logo_url: null,
    cover_image_url: null,
    category: "Distribution & Logistics",
    published: false,
    featured: false,
    sort_order: 103,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    name: "Kingo",
    slug: "kingo",
    short_description: "Mobility solution for manned guarding operations.",
    description:
      "Kingo is a mobility solution for managing manned guarding operations with apps for patrolling personnel, guarding supervisors, and guards. Training modules can be added in Admin.",
    logo_url: null,
    cover_image_url: null,
    category: "Workforce & Security",
    published: false,
    featured: false,
    sort_order: 104,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    name: "RocketBI",
    slug: "rocketbi",
    short_description:
      "Business intelligence and reporting for Maxpro solutions.",
    description:
      "RocketBI supports business intelligence and reporting across Maxpro deployments.",
    logo_url: null,
    cover_image_url: null,
    category: "Analytics & Intelligence",
    published: false,
    featured: false,
    sort_order: 105,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "11111111-1111-1111-1111-111111111199",
    name: "General Training",
    slug: "general-training",
    short_description:
      "Soft-skills and general sales training not tied to a specific Maxpro product.",
    description:
      "Use General Training for Academy courses that teach sales skills, onboarding soft skills, or other topics that are not product-specific.",
    logo_url: null,
    cover_image_url: null,
    category: "Sales & Field Operations",
    published: true,
    featured: false,
    sort_order: 200,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];

const courses: Course[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    product_id: "11111111-1111-1111-1111-111111111101",
    title: "Rockey Fundamentals",
    slug: "rockey-fundamentals",
    description:
      "A structured introduction to Rockey for field teams and managers. Learn how to navigate the application, work with customers and products, create sales orders, and understand common operational workflows.",
    short_description:
      "Learn the core Rockey workflows for field sales operations.",
    thumbnail_url: "/products/rockey/cover.png",
    level: "beginner",
    estimated_minutes: 95,
    published: true,
    featured: true,
    certificate_enabled: true,
    sort_order: 1,
    learning_outcomes: [
      "Navigate the Rockey application confidently",
      "Find and manage customer records",
      "Work with products and pricing views",
      "Create and submit a sales order",
      "Understand field operations and basic reports",
      "Recognize common administration tasks",
    ],
    status: "published",
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    product_id: "11111111-1111-1111-1111-111111111102",
    title: "RocketSales Fundamentals",
    slug: "rocketsales-fundamentals",
    description:
      "A structured introduction to RocketSales for field teams. Learn workspace navigation, field visits, orders, productivity habits, and reporting entry points.",
    short_description:
      "Learn the core RocketSales workflows for field productivity.",
    thumbnail_url: null,
    level: "beginner",
    estimated_minutes: 75,
    published: false,
    featured: false,
    certificate_enabled: true,
    sort_order: 2,
    learning_outcomes: [
      "Understand the RocketSales workspace",
      "Plan and complete a field visit",
      "Create a basic customer order",
      "Review productivity and reporting entry points",
    ],
    status: "archived",
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    product_id: "11111111-1111-1111-1111-111111111103",
    title: "RocketSales Pharma Fundamentals",
    slug: "rocketsales-pharma-fundamentals",
    description:
      "A structured introduction to RocketSales Pharma for medical reps and pharma field teams. Learn the home dashboard, doctors and customer workflows, reports, service calls, and how orders can be placed.",
    short_description:
      "Learn core RocketSales Pharma workflows for pharmaceutical field teams.",
    thumbnail_url: "/products/rocketsales-pharma/cover.png",
    level: "beginner",
    estimated_minutes: 55,
    published: true,
    featured: true,
    certificate_enabled: true,
    sort_order: 3,
    learning_outcomes: [
      "Navigate the RocketSales Pharma home dashboard",
      "Use Doctors, Customers, and Stock navigation",
      "Open pharma field reports for visits, samples, and orders",
      "Locate Service Calls for field support activity",
      "Understand how orders can be placed in the app",
    ],
    status: "published",
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  mvpAgroCourse,
  playlistTestCourse,
  rockeyTutorialVideosCourse,
  rocketsalesPharmaTutorialVideosCourse,
];

const courseTagSlugs: Record<string, string[]> = {
  "22222222-2222-2222-2222-222222222201": [
    "fundamentals",
    "field-sales",
    "orders",
  ],
  "22222222-2222-2222-2222-222222222202": [
    "fundamentals",
    "field-sales",
  ],
  "22222222-2222-2222-2222-222222222203": [
    "fundamentals",
    "field-sales",
  ],
  "22222222-2222-2222-2222-222222222204": [
    "fundamentals",
    "field-sales",
  ],
  "22222222-2222-2222-2222-222222222299": ["fundamentals"],
  "22222222-2222-2222-2222-222222222205": [
    "field-sales",
    "orders",
    "video",
  ],
  "22222222-2222-2222-2222-222222222206": [
    "field-sales",
    "pharma",
    "video",
  ],
};

const baseModules: Module[] = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Getting Started",
    description: "Orientation and first login.",
    sort_order: 1,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Customers",
    description: "Working with customer records.",
    sort_order: 2,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333303",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Products",
    description: "Browsing and managing product information.",
    sort_order: 3,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333304",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Sales Orders",
    description: "Creating and submitting orders.",
    sort_order: 4,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333305",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Field Operations",
    description: "Day-to-day field activities.",
    sort_order: 5,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333306",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Reports",
    description: "Reviewing sales and activity reports.",
    sort_order: 6,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333307",
    course_id: "22222222-2222-2222-2222-222222222201",
    title: "Administration",
    description: "Common admin tasks for supervisors.",
    sort_order: 7,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333311",
    course_id: "22222222-2222-2222-2222-222222222202",
    title: "Getting Started",
    description: "Orientation for RocketSales.",
    sort_order: 1,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333321",
    course_id: "22222222-2222-2222-2222-222222222203",
    title: "Getting Started",
    description: "Orientation and first look at RocketSales Pharma.",
    sort_order: 1,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333322",
    course_id: "22222222-2222-2222-2222-222222222203",
    title: "Field Activity",
    description: "Reports and service activity for pharma field teams.",
    sort_order: 2,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "33333333-3333-3333-3333-333333333323",
    course_id: "22222222-2222-2222-2222-222222222203",
    title: "Orders",
    description: "How orders can be placed in RocketSales Pharma.",
    sort_order: 3,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];

const modules: Module[] = [
  ...baseModules,
  ...mvpExtraModules,
  ...playlistTestModules,
  rockeyTutorialVideosModule,
  rocketsalesPharmaTutorialVideosModule,
];

const baseLessons: Lesson[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    module_id: "33333333-3333-3333-3333-333333333301",
    title: "Introduction to Rockey",
    slug: "introduction-to-rockey",
    description:
      "Overview of Rockey and how Maxpro Academy training is organized.",
    learning_objective:
      "Explain what Rockey is used for and how this course is structured.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 240,
    thumbnail_url: "/products/rockey/cover.png",
    transcript:
      "Welcome to Rockey Fundamentals. This course introduces the core workflows used by field teams.",
    written_content:
      "## What you'll learn\n\nRockey helps field teams manage sales activities from customer visits through order submission.\n\n![Rockey — all-in-one sales app for field teams](/products/rockey/cover.png)\n\n## Step 1\n\nOpen Maxpro Academy and enroll in Rockey Fundamentals if you have not already.\n\n## Step 2\n\nReview the course modules so you know the learning path.\n\n> Tip: Use the course outline on the right to jump between lessons as you learn.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    module_id: "33333333-3333-3333-3333-333333333301",
    title: "Logging In",
    slug: "logging-in",
    description: "Sign in and prepare your workspace.",
    learning_objective: "Successfully sign in and reach the main workspace.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 180,
    thumbnail_url: "/products/rockey/screenshot-dashboard.jpeg",
    transcript:
      "Learn how to sign in to Rockey with credentials provided by your administrator.",
    written_content:
      "## What you'll learn\n\nHow to access Rockey securely and reach the home workspace.\n\n![Rockey home dashboard after sign-in](/products/rockey/screenshot-dashboard.jpeg)\n\n## Step 1\n\nOpen the Rockey application provided by Maxpro.\n\n## Step 2\n\nEnter your username and password.\n\n## Step 3\n\nConfirm you land on the Rockey home screen with your summary metrics.\n\n> Warning: Never share credentials. Contact Maxpro Support if you cannot sign in.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 2,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    module_id: "33333333-3333-3333-3333-333333333301",
    title: "Understanding the Dashboard",
    slug: "understanding-the-dashboard",
    description: "Orient yourself in the main Rockey interface.",
    learning_objective: "Identify the primary areas of the Rockey dashboard.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rockey/screenshot-dashboard.jpeg",
    transcript: "The dashboard surfaces key actions and summaries for your role.",
    written_content:
      "## What you'll learn\n\nThe purpose of the Rockey home dashboard and summary areas.\n\n![Rockey dashboard showing customers, products, visits, and sales](/products/rockey/screenshot-dashboard.jpeg)\n\n## Step 1\n\nLocate the header with your user name and the main Rockey title.\n\n## Step 2\n\nReview the summary cards for Customers, Products, Visits, and Sales.\n\n## Step 3\n\nUse the bottom navigation — Home, Reports, Customers, and Stock — to move between areas.\n\n> Tip: Your numbers will reflect your route and role.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 3,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444404",
    module_id: "33333333-3333-3333-3333-333333333301",
    title: "Navigating the Application",
    slug: "navigating-the-application",
    description: "Move confidently between Rockey screens.",
    learning_objective:
      "Navigate between common Rockey screens without getting lost.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 240,
    thumbnail_url: "/products/rockey/screenshot-dashboard.jpeg",
    transcript: "Practice moving between modules using the main menu.",
    written_content:
      "## Step 1\n\nFrom Home, open the bottom navigation.\n\n![Rockey home with bottom navigation](/products/rockey/screenshot-dashboard.jpeg)\n\n## Step 2\n\nMove to Customers, then return to Home.\n\n## Step 3\n\nOpen Reports and Stock to confirm you can reach each area.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 4,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444405",
    module_id: "33333333-3333-3333-3333-333333333302",
    title: "Managing Customers",
    slug: "managing-customers",
    description: "Find and review customer records.",
    learning_objective:
      "Locate a customer and review key profile fields.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 360,
    thumbnail_url: "/products/rockey/screenshot-customers.jpeg",
    transcript: "Customer records are central to field sales workflows.",
    written_content:
      "## Step 1\n\nOpen Customers from the bottom navigation.\n\n![Rockey Customers list](/products/rockey/screenshot-customers.jpeg)\n\n## Step 2\n\nSearch for a customer by name or code.\n\n## Step 3\n\nReview the customer card — code, location, category, and credit status.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444406",
    module_id: "33333333-3333-3333-3333-333333333302",
    title: "Creating a Customer",
    slug: "creating-a-customer",
    description: "Add a new customer when your role permits it.",
    learning_objective: "Create a customer record using required fields.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rockey/screenshot-customers.jpeg",
    transcript:
      "Some roles can create customers; others may only update visits.",
    written_content:
      "## Step 1\n\nOpen Customers and tap the add-customer button if your role allows it.\n\n![Rockey Customers screen with add action](/products/rockey/screenshot-customers.jpeg)\n\n## Step 2\n\nEnter the required fields provided by your administrator.\n\n## Step 3\n\nSave and confirm the customer appears in the list.\n\n> Warning: Required fields may differ based on how your organization configures Rockey.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 2,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444407",
    module_id: "33333333-3333-3333-3333-333333333303",
    title: "Managing Products",
    slug: "managing-products",
    description: "Browse the product catalog used during selling.",
    learning_objective:
      "Find a product and confirm pricing or availability views available to your role.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rockey/screenshot-stock-request.jpeg",
    transcript: "The product catalog supports accurate order capture.",
    written_content:
      "## Step 1\n\nOpen Stock and locate product search.\n\n![Rockey Stock Request product list](/products/rockey/screenshot-stock-request.jpeg)\n\n## Step 2\n\nSearch for a known SKU or product name.\n\n## Step 3\n\nReview units and quantities available for field users.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444408",
    module_id: "33333333-3333-3333-3333-333333333304",
    title: "Creating a Sales Order",
    slug: "creating-a-sales-order",
    description: "Build an order for a customer.",
    learning_objective:
      "Create a draft sales order with at least one line item.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 420,
    thumbnail_url: "/products/rockey/screenshot-customers.jpeg",
    transcript: "Order creation is one of the most common Rockey workflows.",
    written_content:
      "## Step 1\n\nOpen Customers and select the customer.\n\n![Select a customer before creating an order](/products/rockey/screenshot-customers.jpeg)\n\n## Step 2\n\nSelect New Order.\n\n## Step 3\n\nAdd products and quantities.\n\n## Step 4\n\nReview totals before submission.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444409",
    module_id: "33333333-3333-3333-3333-333333333304",
    title: "Submitting an Order",
    slug: "submitting-an-order",
    description:
      "Submit an order through the approval or sync path used by your organization.",
    learning_objective:
      "Submit an order and confirm its status updates.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rockey/screenshot-reports.jpeg",
    transcript: "Submission rules depend on your Maxpro configuration.",
    written_content:
      "## Step 1\n\nOpen the draft order.\n\n## Step 2\n\nValidate required fields.\n\n## Step 3\n\nSubmit the order and note the resulting status.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 2,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444410",
    module_id: "33333333-3333-3333-3333-333333333305",
    title: "Field Day Workflow",
    slug: "field-day-workflow",
    description: "A practical overview of a typical field day.",
    learning_objective: "Describe the sequence of a typical Rockey field day.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 360,
    thumbnail_url: "/products/rockey/screenshot-dashboard.jpeg",
    transcript:
      "Field days usually combine visits, orders, and activity capture.",
    written_content:
      "## Step 1\n\nStart from Home and review today's activity.\n\n![Rockey home for a typical field day](/products/rockey/screenshot-dashboard.jpeg)\n\n## Step 2\n\nComplete customer interactions and capture required data.\n\n## Step 3\n\nSubmit orders and close the day according to your process.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444411",
    module_id: "33333333-3333-3333-3333-333333333306",
    title: "Viewing Sales Reports",
    slug: "viewing-sales-reports",
    description: "Find and interpret common sales reports.",
    learning_objective:
      "Open a sales report and identify key metrics available to your role.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rockey/screenshot-reports.jpeg",
    transcript: "Reports help teams understand performance.",
    written_content:
      "## Step 1\n\nOpen Reports from the bottom navigation.\n\n![Rockey Reports menu](/products/rockey/screenshot-reports.jpeg)\n\n## Step 2\n\nSelect Sales, Orders, or another report available to your role.\n\n## Step 3\n\nReview the result and note how it reflects your field activity.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444412",
    module_id: "33333333-3333-3333-3333-333333333307",
    title: "Managing Users",
    slug: "managing-users",
    description: "Overview of user administration for supervisors.",
    learning_objective:
      "Identify where user management is accessed when your role allows it.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rockey/screenshot-dashboard.jpeg",
    transcript:
      "User administration is typically restricted to supervisors and admins.",
    written_content:
      "## Step 1\n\nConfirm you have an administrative role.\n\n## Step 2\n\nOpen the user management area if available.\n\n## Step 3\n\nReview how users are assigned to teams or territories in your deployment.\n\n> Tip: Exact admin screens can vary by role and configuration.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444421",
    module_id: "33333333-3333-3333-3333-333333333311",
    title: "Welcome to RocketSales",
    slug: "welcome-to-rocketsales",
    description: "Orientation for RocketSales Fundamentals.",
    learning_objective:
      "Describe the purpose of RocketSales for field productivity.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 180,
    thumbnail_url: null,
    transcript: null,
    written_content:
      "## What you'll learn\n\nRocketSales supports field sales productivity and reporting.\n\n## Step 1\n\nSign in to RocketSales with credentials from your administrator.\n\n## Step 2\n\nLocate the main navigation used for visits, orders, and reports.\n\n## Key takeaways\n\n- RocketSales is built for field productivity\n- Navigation depends on your role\n- Start with visits and orders for daily work",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444422",
    module_id: "33333333-3333-3333-3333-333333333311",
    title: "RocketSales Workspace Overview",
    slug: "rocketsales-workspace-overview",
    description: "A first look at the RocketSales workspace.",
    learning_objective:
      "Identify the primary areas of the RocketSales workspace.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 240,
    thumbnail_url: null,
    transcript: null,
    written_content:
      "## Step 1\n\nSign in to RocketSales.\n\n## Step 2\n\nLocate navigation for visits, orders, and reports as enabled for your role.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 2,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444431",
    module_id: "33333333-3333-3333-3333-333333333321",
    title: "Introduction to RocketSales Pharma",
    slug: "introduction-to-rocketsales-pharma",
    description:
      "Overview of RocketSales Pharma for medical reps and pharma field teams.",
    learning_objective:
      "Explain what RocketSales Pharma is used for in pharmaceutical field operations.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 210,
    thumbnail_url: "/products/rocketsales-pharma/cover.png",
    transcript:
      "Welcome to RocketSales Pharma Fundamentals for pharmaceutical field teams.",
    written_content:
      "## What you'll learn\n\nRocketSales Pharma helps medical reps and pharma field teams manage customers, doctors, visits, samples, and orders.\n\n![RocketSales Pharma — all-in-one sales app for field teams](/products/rocketsales-pharma/cover.png)\n\n## Step 1\n\nEnroll in RocketSales Pharma Fundamentals.\n\n## Step 2\n\nReview the modules so you know the learning path.\n\n> Tip: Use the course outline to move between lessons as you learn.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444432",
    module_id: "33333333-3333-3333-3333-333333333321",
    title: "Understanding the Pharma Dashboard",
    slug: "understanding-the-pharma-dashboard",
    description: "Orient yourself on the RocketSales Pharma home screen.",
    learning_objective:
      "Identify customers, doctors, visits, and order summaries on the home dashboard.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rocketsales-pharma/screenshot-dashboard.jpeg",
    transcript:
      "The Pharma dashboard surfaces customers, doctors, visits, and orders for your route.",
    written_content:
      "## What you'll learn\n\nThe RocketSales Pharma home dashboard and bottom navigation.\n\n![RocketSales Pharma home dashboard](/products/rocketsales-pharma/screenshot-dashboard.jpeg)\n\n## Step 1\n\nLocate your user name under the RocketSales header.\n\n## Step 2\n\nReview the summary cards for Customers, Doctors, Visits, and Orders.\n\n## Step 3\n\nUse the bottom navigation — Home, Reports, Service Calls, Customers, Doctors, and Stock.\n\n> Tip: Month's Order and Today's Order help you track progress during the cycle.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 2,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444433",
    module_id: "33333333-3333-3333-3333-333333333321",
    title: "Navigating Doctors and Customers",
    slug: "navigating-doctors-and-customers",
    description: "Move between Doctors, Customers, and Stock in the app.",
    learning_objective:
      "Use bottom navigation to open Doctors, Customers, and Stock areas.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 240,
    thumbnail_url: "/products/rocketsales-pharma/screenshot-dashboard.jpeg",
    transcript: null,
    written_content:
      "## Step 1\n\nFrom Home, open the bottom navigation.\n\n![RocketSales Pharma home with Doctors and Customers tabs](/products/rocketsales-pharma/screenshot-dashboard.jpeg)\n\n## Step 2\n\nOpen Doctors, then return to Home.\n\n## Step 3\n\nOpen Customers and Stock to confirm you can reach each area used on a typical pharma field day.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 3,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444434",
    module_id: "33333333-3333-3333-3333-333333333322",
    title: "Using Pharma Reports",
    slug: "using-pharma-reports",
    description: "Find visits, detailing, samples, gifts, and order reports.",
    learning_objective:
      "Open the Reports menu and identify key pharma field report types.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 300,
    thumbnail_url: "/products/rocketsales-pharma/screenshot-reports.jpeg",
    transcript: null,
    written_content:
      "## Step 1\n\nOpen Reports from the bottom navigation.\n\n![RocketSales Pharma Reports menu](/products/rocketsales-pharma/screenshot-reports.jpeg)\n\n## Step 2\n\nLocate Visits, Detailing, Samples, Gifts, and Orders.\n\n## Step 3\n\nOpen Route Plan or Payment Collection when those workflows apply to your role.\n\n> Tip: Pharma reports also include Service Call History and Feedback.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444435",
    module_id: "33333333-3333-3333-3333-333333333322",
    title: "Service Calls",
    slug: "service-calls",
    description: "Locate and manage service call activity.",
    learning_objective:
      "Open Service Calls and describe when to use this screen in the field.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 240,
    thumbnail_url: "/products/rocketsales-pharma/screenshot-service-calls.jpeg",
    transcript: null,
    written_content:
      "## Step 1\n\nOpen Service Calls from the bottom navigation.\n\n![RocketSales Pharma Service Calls](/products/rocketsales-pharma/screenshot-service-calls.jpeg)\n\n## Step 2\n\nUse the calendar or add action when your role allows new service call entries.\n\n## Step 3\n\nReturn to Reports → Service Call History to review past activity.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 2,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "44444444-4444-4444-4444-444444444436",
    module_id: "33333333-3333-3333-3333-333333333323",
    title: "How Orders Can Be Placed",
    slug: "how-orders-can-be-placed",
    description: "Confirm the order placement options available in Pharma.",
    learning_objective:
      "List the ways orders can be placed using RocketSales Pharma.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 240,
    thumbnail_url: "/products/rocketsales-pharma/screenshot-question-bank.jpeg",
    transcript: null,
    written_content:
      "## What you'll learn\n\nOrders in RocketSales Pharma can be placed through several supported paths.\n\n![RocketSales Pharma order placement check](/products/rocketsales-pharma/screenshot-question-bank.jpeg)\n\n## Step 1\n\nReview the order options shown in training: Direct Orders, Transfer Orders, and Order Books.\n\n## Step 2\n\nConfirm which options your organization enables for your role.\n\n## Step 3\n\nPractice locating Orders from Reports when you need to review order activity.\n\n> Tip: Your administrator can confirm which order paths are active in your deployment.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];

const lessons: Lesson[] = [
  ...baseLessons,
  ...mvpExtraLessons,
  ...playlistTestLessons,
  ...rockeyTutorialVideosLessons,
  ...rocketsalesPharmaTutorialVideosLessons,
];

const lessonResources: LessonResource[] = [
  {
    id: "res-order-checklist",
    lesson_id: "44444444-4444-4444-4444-444444444408",
    title: "Order checklist",
    description:
      "A simple checklist for validating an order before submission.",
    file_url: "https://maxproinfotech.com",
    resource_type: "link",
    created_at: TIMESTAMP,
  },
];

const quizzes: Quiz[] = [
  {
    id: "55555555-5555-5555-5555-555555555501",
    lesson_id: "44444444-4444-4444-4444-444444444413",
    title: "Rockey Fundamentals — Final Knowledge Check",
    description:
      "Confirm you understand core Rockey workflows. Passing score: 70%.",
    passing_score: 70,
    required: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  ...mvpExtraQuizzes,
  ...playlistTestQuizzes,
  ...rocketsalesPharmaTutorialQuizzes,
];

const quizQuestions: QuizQuestion[] = [
  {
    id: "66666666-6666-6666-6666-666666666601",
    quiz_id: "55555555-5555-5555-5555-555555555501",
    question:
      "What is the recommended first step when creating a sales order in Rockey?",
    explanation: "Orders are typically created in the context of a customer.",
    sort_order: 1,
    created_at: TIMESTAMP,
  },
  {
    id: "66666666-6666-6666-6666-666666666602",
    quiz_id: "55555555-5555-5555-5555-555555555501",
    question: "Before submitting an order, what should you do?",
    explanation: "Always review line items and totals before submission.",
    sort_order: 2,
    created_at: TIMESTAMP,
  },
  ...mvpExtraQuizQuestions,
  ...playlistTestQuizQuestions,
  ...rocketsalesPharmaTutorialQuizQuestions,
];

const quizOptions: QuizOption[] = [
  {
    id: "opt-601-1",
    question_id: "66666666-6666-6666-6666-666666666601",
    option_text: "Select the customer, then create a new order",
    is_correct: true,
    sort_order: 1,
  },
  {
    id: "opt-601-2",
    question_id: "66666666-6666-6666-6666-666666666601",
    option_text: "Delete all previous orders first",
    is_correct: false,
    sort_order: 2,
  },
  {
    id: "opt-601-3",
    question_id: "66666666-6666-6666-6666-666666666601",
    option_text: "Change your password",
    is_correct: false,
    sort_order: 3,
  },
  {
    id: "opt-601-4",
    question_id: "66666666-6666-6666-6666-666666666601",
    option_text: "Uninstall the application",
    is_correct: false,
    sort_order: 4,
  },
  {
    id: "opt-602-1",
    question_id: "66666666-6666-6666-6666-666666666602",
    option_text: "Review products, quantities, and totals",
    is_correct: true,
    sort_order: 1,
  },
  {
    id: "opt-602-2",
    question_id: "66666666-6666-6666-6666-666666666602",
    option_text: "Close the app immediately",
    is_correct: false,
    sort_order: 2,
  },
  {
    id: "opt-602-3",
    question_id: "66666666-6666-6666-6666-666666666602",
    option_text: "Create a second identical order",
    is_correct: false,
    sort_order: 3,
  },
  {
    id: "opt-602-4",
    question_id: "66666666-6666-6666-6666-666666666602",
    option_text: "Ignore validation messages",
    is_correct: false,
    sort_order: 4,
  },
  ...mvpExtraQuizOptions,
  ...playlistTestQuizOptions,
  ...rocketsalesPharmaTutorialQuizOptions,
];

const mutableAnnouncements: Announcement[] = [
  {
    id: "announcement-welcome",
    title: "Welcome to Maxpro Academy",
    content:
      "Welcome to Maxpro Academy. Browse solutions and courses to begin structured training.",
    type: "info",
    published: true,
    created_at: TIMESTAMP,
  },
];

// Demo admin account: admin@maxproinfotech.com — any password works in demo mode.
const DEMO_ADMIN_EMAIL = "admin@maxproinfotech.com";

const mutableProducts: Product[] = products.map((item) => ({ ...item }));
const mutableCourses: Course[] = courses.map((item) => ({ ...item }));
const mutableModules: Module[] = modules.map((item) => ({ ...item }));
const mutableLessons: Lesson[] = lessons.map((item) => ({ ...item }));
const mutableQuizzes: Quiz[] = quizzes.map((item) => ({ ...item }));
const mutableQuizQuestions: QuizQuestion[] = quizQuestions.map((item) => ({
  ...item,
}));
const mutableQuizOptions: QuizOption[] = quizOptions.map((item) => ({ ...item }));

export interface CourseWithModules extends Course {
  product?: Product;
  modules: (Module & { lessons: Lesson[] })[];
  tags?: Tag[];
}

export interface LessonWithContext extends Lesson {
  module: Module;
  course: Course;
  product?: Product;
  resources?: LessonResource[];
  quiz?: Quiz & { questions: (QuizQuestion & { options: QuizOption[] })[] };
}

export interface SearchResultItem {
  type: "product" | "course" | "lesson";
  id: string;
  title: string;
  slug: string;
  description: string | null;
  productSlug?: string;
  courseSlug?: string;
  productName?: string;
  courseTitle?: string;
}

function attachProductToCourse(course: Course): Course {
  const product = mutableProducts.find((item) => item.id === course.product_id);
  return product ? { ...course, product } : course;
}

function getLessonsForModule(moduleId: string): Lesson[] {
  return mutableLessons
    .filter((lesson) => lesson.module_id === moduleId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getCategories(): Category[] {
  return [...categories];
}

export function getTags(): Tag[] {
  return [...tags];
}

export function getAnnouncements(publishedOnly = true): Announcement[] {
  return mutableAnnouncements.filter(
    (item) => !publishedOnly || item.published,
  );
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDemoAnnouncement(
  data: Omit<Announcement, "id" | "created_at">,
): Announcement {
  const record: Announcement = {
    ...data,
    id: newId(),
    created_at: new Date().toISOString(),
  };
  mutableAnnouncements.push(record);
  return record;
}

export function updateDemoAnnouncement(
  id: string,
  updates: Partial<Announcement>,
): Announcement | null {
  const index = mutableAnnouncements.findIndex((item) => item.id === id);
  if (index === -1) return null;
  mutableAnnouncements[index] = { ...mutableAnnouncements[index], ...updates };
  return mutableAnnouncements[index];
}

export function deleteDemoAnnouncement(id: string): boolean {
  const index = mutableAnnouncements.findIndex((item) => item.id === id);
  if (index === -1) return false;
  mutableAnnouncements.splice(index, 1);
  return true;
}

export function getProducts(options?: {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
}): Product[] {
  const { publishedOnly = true, featuredOnly = false } = options ?? {};

  return mutableProducts
    .filter((product) => {
      if (publishedOnly && !product.published) return false;
      if (featuredOnly && !product.featured) return false;
      return true;
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getProductBySlug(slug: string): Product | null {
  return mutableProducts.find((product) => product.slug === slug) ?? null;
}

export function getProductById(id: string): Product | null {
  return mutableProducts.find((product) => product.id === id) ?? null;
}

export function getCourses(options?: {
  productId?: string;
  productSlug?: string;
  publishedOnly?: boolean;
  featuredOnly?: boolean;
}): Course[] {
  const { productId, productSlug, publishedOnly = true, featuredOnly = false } =
    options ?? {};

  let productFilterId = productId;
  if (productSlug) {
    const product = getProductBySlug(productSlug);
    productFilterId = product?.id;
    if (!productFilterId) {
      return [];
    }
  }

  return mutableCourses
    .filter((course) => {
      if (productFilterId && course.product_id !== productFilterId) {
        return false;
      }
      if (publishedOnly && !course.published) return false;
      if (featuredOnly && !course.featured) return false;
      return true;
    })
    .map(attachProductToCourse)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getCourseBySlug(slug: string): Course | null {
  const course = mutableCourses.find((item) => item.slug === slug);
  return course ? attachProductToCourse(course) : null;
}

export function getCourseById(id: string): Course | null {
  const course = mutableCourses.find((item) => item.id === id);
  return course ? attachProductToCourse(course) : null;
}

export function getModulesByCourseId(courseId: string): Module[] {
  return mutableModules
    .filter((module) => module.course_id === courseId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getCourseForModuleId(moduleId: string): Course | null {
  const courseModule = mutableModules.find((item) => item.id === moduleId);
  if (!courseModule) return null;
  return getCourseById(courseModule.course_id);
}

export function getCourseWithModules(
  slugOrId: string,
): CourseWithModules | null {
  const course =
    getCourseBySlug(slugOrId) ?? getCourseById(slugOrId);

  if (!course) {
    return null;
  }

  const courseModules = getModulesByCourseId(course.id).map((courseModule) => ({
    ...courseModule,
    lessons: getLessonsForModule(courseModule.id),
  }));

  const tagSlugs = courseTagSlugs[course.id] ?? [];
  const courseTags = tags.filter((tag) => tagSlugs.includes(tag.slug));

  return {
    ...course,
    modules: courseModules,
    tags: courseTags,
  };
}

export function getLessonById(id: string): Lesson | null {
  return mutableLessons.find((lesson) => lesson.id === id) ?? null;
}

export function getOrderedLessonsForCourse(courseId: string): Lesson[] {
  const courseModules = getModulesByCourseId(courseId);
  return courseModules.flatMap((courseModule) =>
    getLessonsForModule(courseModule.id),
  );
}

export function getAdjacentLessons(
  courseSlug: string,
  lessonSlug: string,
): { previous: Lesson | null; next: Lesson | null } {
  const course = getCourseBySlug(courseSlug);
  if (!course) {
    return { previous: null, next: null };
  }

  const ordered = getOrderedLessonsForCourse(course.id);
  const index = ordered.findIndex((lesson) => lesson.slug === lessonSlug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}

export function getLessonBySlugs(
  courseSlug: string,
  lessonSlug: string,
): LessonWithContext | null {
  const course = getCourseBySlug(courseSlug);
  if (!course) {
    return null;
  }

  const courseModules = getModulesByCourseId(course.id);
  for (const courseModule of courseModules) {
    const lesson = getLessonsForModule(courseModule.id).find(
      (item) => item.slug === lessonSlug,
    );

    if (lesson) {
      return buildLessonContext(lesson, courseModule, course);
    }
  }

  return null;
}

function buildLessonContext(
  lesson: Lesson,
  module: Module,
  course: Course,
): LessonWithContext {
  const product = getProductById(course.product_id);
  const resources = lessonResources.filter(
    (resource) => resource.lesson_id === lesson.id,
  );
  const quiz = getQuizByLessonId(lesson.id);

  return {
    ...lesson,
    module,
    course: attachProductToCourse(course),
    product: product ?? undefined,
    resources,
    quiz: quiz ?? undefined,
  };
}

export function getQuizByLessonId(
  lessonId: string,
): (Quiz & { questions: (QuizQuestion & { options: QuizOption[] })[] }) | null {
  const quiz = mutableQuizzes.find((item) => item.lesson_id === lessonId);
  if (!quiz) {
    return null;
  }

  const questions = mutableQuizQuestions
    .filter((question) => question.quiz_id === quiz.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((question) => ({
      ...question,
      options: mutableQuizOptions
        .filter((option) => option.question_id === question.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));

  return { ...quiz, questions };
}

export function getLessonResources(lessonId: string): LessonResource[] {
  return lessonResources.filter((resource) => resource.lesson_id === lessonId);
}

export function searchContent(query: string, limit = 20): SearchResultItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const results: SearchResultItem[] = [];

  for (const product of mutableProducts) {
    if (
      product.name.toLowerCase().includes(normalized) ||
      product.slug.includes(normalized) ||
      product.short_description?.toLowerCase().includes(normalized) ||
      product.description?.toLowerCase().includes(normalized)
    ) {
      results.push({
        type: "product",
        id: product.id,
        title: product.name,
        slug: product.slug,
        description: product.short_description,
      });
    }
  }

  for (const course of mutableCourses) {
    if (
      course.title.toLowerCase().includes(normalized) ||
      course.slug.includes(normalized) ||
      course.short_description?.toLowerCase().includes(normalized) ||
      course.description?.toLowerCase().includes(normalized)
    ) {
      const product = getProductById(course.product_id);
      results.push({
        type: "course",
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.short_description,
        productSlug: product?.slug,
        productName: product?.name,
      });
    }
  }

  for (const lesson of mutableLessons) {
    if (
      lesson.title.toLowerCase().includes(normalized) ||
      lesson.slug.includes(normalized) ||
      lesson.description?.toLowerCase().includes(normalized) ||
      lesson.written_content?.toLowerCase().includes(normalized)
    ) {
      const courseModule = mutableModules.find((item) => item.id === lesson.module_id);
      const course = courseModule
        ? mutableCourses.find((item) => item.id === courseModule.course_id)
        : undefined;
      const product = course ? getProductById(course.product_id) : undefined;

      results.push({
        type: "lesson",
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        courseSlug: course?.slug,
        courseTitle: course?.title,
        productSlug: product?.slug,
        productName: product?.name,
      });
    }
  }

  return results.slice(0, limit);
}

export function getFeaturedProducts(): Product[] {
  return getProducts({ publishedOnly: true, featuredOnly: true });
}

export function getFeaturedCourses(): Course[] {
  return getCourses({ publishedOnly: true, featuredOnly: true });
}

export function getAllLessons(): Lesson[] {
  return [...mutableLessons].sort((a, b) => a.sort_order - b.sort_order);
}

// ─── Demo session & mutable state ───────────────────────────────────────────

export interface DemoUserSession {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company?: string | null;
  job_title?: string | null;
  phone?: string | null;
  learning_role?: LearningRole | null;
  preferred_product_ids?: string[] | null;
  onboarding_completed: boolean;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface DemoRegisteredUser extends DemoUserSession {
  password: string;
}

type DemoRuntimeState = {
  demoUsers: Map<string, DemoRegisteredUser>;
  enrollments: Map<string, Enrollment>;
  lessonProgress: Map<string, LessonProgress>;
  quizAttempts: Map<string, QuizAttempt>;
  certificates: Map<string, Certificate>;
  certificateSequence: number;
};

const globalForDemo = globalThis as typeof globalThis & {
  __maxacademyDemoRuntime?: DemoRuntimeState;
};

const demoRuntime: DemoRuntimeState =
  globalForDemo.__maxacademyDemoRuntime ?? {
    demoUsers: new Map<string, DemoRegisteredUser>(),
    enrollments: new Map<string, Enrollment>(),
    lessonProgress: new Map<string, LessonProgress>(),
    quizAttempts: new Map<string, QuizAttempt>(),
    certificates: new Map<string, Certificate>(),
    certificateSequence: 1,
  };

globalForDemo.__maxacademyDemoRuntime = demoRuntime;

const demoUsers = demoRuntime.demoUsers;
const enrollments = demoRuntime.enrollments;
const lessonProgress = demoRuntime.lessonProgress;
const quizAttempts = demoRuntime.quizAttempts;
const certificates = demoRuntime.certificates;

function progressKey(userId: string, lessonId: string): string {
  return `${userId}:${lessonId}`;
}

function enrollmentKey(userId: string, courseId: string): string {
  return `${userId}:${courseId}`;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function registerDemoUser(input: {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  company?: string | null;
  job_title?: string | null;
  phone?: string | null;
  onboarding_completed?: boolean;
}): DemoUserSession {
  const existing = demoUsers.get(input.email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const session: DemoRegisteredUser = {
    id: generateId(),
    email: input.email.toLowerCase(),
    password: input.password,
    full_name: input.full_name,
    role: input.role ?? "customer",
    company: input.company ?? null,
    job_title: input.job_title ?? null,
    phone: input.phone ?? null,
    learning_role: null,
    preferred_product_ids: null,
    onboarding_completed: input.onboarding_completed ?? false,
    avatar_url: null,
    created_at: now,
    updated_at: now,
  };

  demoUsers.set(session.email, session);
  const { password: _password, ...publicSession } = session;
  return publicSession;
}

export function upsertDemoLearnerInvite(input: {
  email: string;
  password: string;
  full_name: string;
  company?: string | null;
  job_title?: string | null;
  phone?: string | null;
}): DemoUserSession {
  const normalized = input.email.toLowerCase();
  const existing = demoUsers.get(normalized);
  const now = new Date().toISOString();

  if (existing) {
    const updated: DemoRegisteredUser = {
      ...existing,
      full_name: input.full_name,
      company: input.company ?? existing.company ?? null,
      job_title: input.job_title ?? existing.job_title ?? null,
      phone: input.phone ?? existing.phone ?? null,
      password: input.password,
      onboarding_completed: false,
      updated_at: now,
    };
    demoUsers.set(normalized, updated);
    const { password: _password, ...session } = updated;
    return session;
  }

  return registerDemoUser({
    email: input.email,
    password: input.password,
    full_name: input.full_name,
    company: input.company,
    job_title: input.job_title,
    phone: input.phone,
    onboarding_completed: false,
  });
}

export function updateDemoUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): boolean {
  const normalized = email.toLowerCase();
  const user = demoUsers.get(normalized);
  if (!user) {
    return false;
  }

  const isDemoAdmin = normalized === DEMO_ADMIN_EMAIL;
  if (!isDemoAdmin && user.password !== currentPassword) {
    return false;
  }

  demoUsers.set(normalized, { ...user, password: newPassword });
  return true;
}

export function authenticateDemoUser(
  email: string,
  password: string,
): DemoUserSession | null {
  const normalized = email.toLowerCase();
  const user = demoUsers.get(normalized);

  if (!user) {
    return null;
  }

  const isDemoAdmin = normalized === DEMO_ADMIN_EMAIL;
  if (!isDemoAdmin && user.password !== password) {
    return null;
  }

  const { password: _password, ...session } = user;
  return session;
}

export function seedDemoAdminAccount(): void {
  if (demoUsers.has(DEMO_ADMIN_EMAIL)) {
    return;
  }

  const now = new Date().toISOString();
  const session: DemoRegisteredUser = {
    id: "demo-admin-00000000-0000-0000-0000-000000000001",
    email: DEMO_ADMIN_EMAIL,
    password: "demo",
    full_name: "Academy Administrator",
    role: "super_admin",
    company: "Maxpro Infotech",
    job_title: "Academy Administrator",
    learning_role: "trainer",
    preferred_product_ids: null,
    onboarding_completed: true,
    avatar_url: null,
    created_at: now,
    updated_at: now,
  };

  demoUsers.set(DEMO_ADMIN_EMAIL, session);
}

export function getAllDemoUsers(): DemoUserSession[] {
  return [...demoUsers.values()].map(({ password: _password, ...session }) => session);
}

export function getDemoAdminEmail(): string {
  return DEMO_ADMIN_EMAIL;
}

export function getDemoUserById(userId: string): DemoUserSession | null {
  for (const user of demoUsers.values()) {
    if (user.id === userId) {
      const { password: _password, ...session } = user;
      return session;
    }
  }
  return null;
}

export function updateDemoUser(
  userId: string,
  updates: Partial<DemoUserSession>,
): DemoUserSession | null {
  for (const [email, user] of demoUsers.entries()) {
    if (user.id === userId) {
      const updated: DemoRegisteredUser = {
        ...user,
        ...updates,
        email: user.email,
        id: user.id,
        updated_at: new Date().toISOString(),
      };
      demoUsers.set(email, updated);
      const { password: _password, ...session } = updated;
      return session;
    }
  }
  return null;
}

export function getDemoUser(emailOrId: string): DemoUserSession | null {
  const byEmail = demoUsers.get(emailOrId.toLowerCase());
  if (byEmail) {
    const { password: _password, ...session } = byEmail;
    return session;
  }
  return getDemoUserById(emailOrId);
}

export function setDemoUser(session: DemoUserSession): DemoUserSession {
  const existing = demoUsers.get(session.email.toLowerCase());
  if (existing) {
    const updated: DemoRegisteredUser = {
      ...existing,
      ...session,
      password: existing.password,
    };
    demoUsers.set(session.email.toLowerCase(), updated);
    const { password: _password, ...result } = updated;
    return result;
  }

  const registered: DemoRegisteredUser = {
    ...session,
    password: "demo",
  };
  demoUsers.set(session.email.toLowerCase(), registered);
  const { password: _password, ...result } = registered;
  return result;
}

export function getDemoEnrollments(userId: string): Enrollment[] {
  return [...enrollments.values()].filter((item) => item.user_id === userId);
}

export function getDemoEnrollment(
  userId: string,
  courseId: string,
): Enrollment | null {
  return enrollments.get(enrollmentKey(userId, courseId)) ?? null;
}

export function enrollDemoUser(userId: string, courseId: string): Enrollment {
  const key = enrollmentKey(userId, courseId);
  const existing = enrollments.get(key);
  if (existing) {
    return existing;
  }

  const enrollment: Enrollment = {
    id: generateId(),
    user_id: userId,
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
    completed_at: null,
    status: "active",
  };

  enrollments.set(key, enrollment);
  return enrollment;
}

export function getDemoLessonProgress(
  userId: string,
  lessonId: string,
): LessonProgress | null {
  return lessonProgress.get(progressKey(userId, lessonId)) ?? null;
}

export function getDemoLessonProgressForUser(userId: string): LessonProgress[] {
  return [...lessonProgress.values()].filter((item) => item.user_id === userId);
}

export function upsertDemoLessonProgress(input: {
  userId: string;
  lessonId: string;
  lastPosition: number;
  watchedSeconds: number;
  completed?: boolean;
}): LessonProgress {
  const key = progressKey(input.userId, input.lessonId);
  const existing = lessonProgress.get(key);
  const now = new Date().toISOString();
  const completed =
    Boolean(existing?.completed) || Boolean(input.completed);

  const record: LessonProgress = {
    id: existing?.id ?? generateId(),
    user_id: input.userId,
    lesson_id: input.lessonId,
    watched_seconds: input.watchedSeconds,
    completed,
    completed_at: completed ? existing?.completed_at ?? now : null,
    last_position: input.lastPosition,
    updated_at: now,
  };

  lessonProgress.set(key, record);
  return record;
}

export function getDemoQuizAttempts(userId: string, quizId?: string): QuizAttempt[] {
  return [...quizAttempts.values()].filter((item) => {
    if (item.user_id !== userId) return false;
    if (quizId && item.quiz_id !== quizId) return false;
    return true;
  });
}

export function addDemoQuizAttempt(attempt: Omit<QuizAttempt, "id">): QuizAttempt {
  const record: QuizAttempt = {
    ...attempt,
    id: generateId(),
  };
  quizAttempts.set(record.id, record);
  return record;
}

export function getDemoCertificates(userId: string): Certificate[] {
  return [...certificates.values()].filter((item) => item.user_id === userId);
}

export function getAllDemoCertificates(): Certificate[] {
  return [...certificates.values()];
}

export function getDemoCertificateById(id: string): Certificate | null {
  return certificates.get(id) ?? null;
}

export function getDemoCertificateByToken(token: string): Certificate | null {
  const normalized = token.trim();
  return (
    [...certificates.values()].find(
      (item) =>
        item.verification_token === normalized ||
        item.certificate_number === normalized ||
        item.certificate_number.toLowerCase() === normalized.toLowerCase(),
    ) ?? null
  );
}

export function getDemoCertificate(
  userId: string,
  courseId: string,
): Certificate | null {
  return (
    [...certificates.values()].find(
      (item) => item.user_id === userId && item.course_id === courseId,
    ) ?? null
  );
}

export function issueDemoCertificate(input: {
  id?: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  verificationToken: string;
  issuedAt?: string;
}): Certificate {
  const existing = getDemoCertificate(input.userId, input.courseId);
  if (existing) {
    return existing;
  }

  const record: Certificate = {
    id: input.id ?? generateId(),
    user_id: input.userId,
    course_id: input.courseId,
    certificate_number: input.certificateNumber,
    issued_at: input.issuedAt ?? new Date().toISOString(),
    verification_token: input.verificationToken,
    pdf_url: null,
  };

  certificates.set(record.id, record);
  return record;
}

export function findDemoCertificate(idOrToken: string): Certificate | null {
  return getDemoCertificateById(idOrToken) ?? getDemoCertificateByToken(idOrToken);
}

export function nextDemoCertificateSequence(): number {
  const value = demoRuntime.certificateSequence;
  demoRuntime.certificateSequence += 1;
  return value;
}

export interface CourseProgressSummary {
  enrolled: boolean;
  completedRequired: number;
  totalRequired: number;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  enrollment: Enrollment | null;
  nextItemKind: "lesson" | "quiz" | null;
}

export function getCourseProgress(
  userId: string,
  courseId: string,
): CourseProgressSummary {
  const enrollment = getDemoEnrollment(userId, courseId);
  const courseModules = getModulesByCourseId(courseId);
  const lessons = courseModules.flatMap((courseModule) =>
    getLessonsForModule(courseModule.id),
  );
  const quizzes = getQuizzesForCourse(courseId);

  const progressRecords = getDemoLessonProgressForUser(userId);
  const completedLessonIds = progressRecords
    .filter((item) => item.completed)
    .map((item) => item.lesson_id);
  const passedQuizIds = quizzes
    .filter((quiz) =>
      getDemoQuizAttempts(userId, quiz.id).some((attempt) => attempt.passed),
    )
    .map((quiz) => quiz.id);

  const rollup = summarizeCourseProgress({
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      required: lesson.required,
      published: lesson.published,
    })),
    quizzes: quizzes.map((quiz) => ({
      id: quiz.id,
      required: quiz.required,
    })),
    completedLessonIds,
    passedQuizIds,
  });

  return {
    enrolled: Boolean(enrollment),
    completedRequired: rollup.completedRequired,
    totalRequired: rollup.totalRequired,
    percent: rollup.percent,
    completedLessons: rollup.completedLessons,
    totalLessons: rollup.totalLessons,
    completedQuizzes: rollup.completedQuizzes,
    totalQuizzes: rollup.totalQuizzes,
    enrollment,
    nextItemKind: rollup.nextItem?.kind ?? null,
  };
}

export function getQuizById(
  quizId: string,
): (Quiz & { questions: (QuizQuestion & { options: QuizOption[] })[] }) | null {
  const quiz = mutableQuizzes.find((item) => item.id === quizId);
  if (!quiz) {
    return null;
  }

  const questions = mutableQuizQuestions
    .filter((question) => question.quiz_id === quiz.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((question) => ({
      ...question,
      options: mutableQuizOptions
        .filter((option) => option.question_id === question.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));

  return { ...quiz, questions };
}

export function getQuizzesForCourse(courseId: string): Quiz[] {
  const courseModuleIds = getModulesByCourseId(courseId).map((item) => item.id);
  const lessonIds = mutableLessons
    .filter((lesson) => courseModuleIds.includes(lesson.module_id))
    .map((lesson) => lesson.id);

  return mutableQuizzes.filter((quiz) => lessonIds.includes(quiz.lesson_id));
}

export function getCourseQuizWithQuestions(courseId: string) {
  const quizzes = getQuizzesForCourse(courseId);
  const quiz = quizzes.at(-1);
  if (!quiz) return null;
  return getQuizById(quiz.id);
}

export function toLearnerQuiz(
  quiz: NonNullable<ReturnType<typeof getQuizById>>,
) {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passing_score: quiz.passing_score,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        option_text: option.option_text,
      })),
    })),
  };
}

export function hasPassedCourseQuiz(userId: string, courseId: string): boolean {
  const quizzes = getQuizzesForCourse(courseId);
  if (quizzes.length === 0) return true;

  return quizzes.every((quiz) => {
    if (!quiz.required) return true;
    return getDemoQuizAttempts(userId, quiz.id).some((attempt) => attempt.passed);
  });
}

export function completeDemoEnrollment(userId: string, courseId: string): Enrollment | null {
  const key = enrollmentKey(userId, courseId);
  const enrollment = enrollments.get(key);
  if (!enrollment) {
    return null;
  }

  const updated: Enrollment = {
    ...enrollment,
    status: "completed",
    completed_at: new Date().toISOString(),
  };

  enrollments.set(key, updated);
  return updated;
}

// Admin mutable CRUD helpers (demo mode)

export function createDemoProduct(data: Product): Product {
  mutableProducts.push(data);
  return data;
}

export function updateDemoProduct(
  id: string,
  updates: Partial<Product>,
): Product | null {
  const index = mutableProducts.findIndex((item) => item.id === id);
  if (index === -1) return null;
  mutableProducts[index] = {
    ...mutableProducts[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mutableProducts[index];
}

export function createDemoCourse(data: Course): Course {
  mutableCourses.push(data);
  return data;
}

export function updateDemoCourse(
  id: string,
  updates: Partial<Course>,
): Course | null {
  const index = mutableCourses.findIndex((item) => item.id === id);
  if (index === -1) return null;
  mutableCourses[index] = {
    ...mutableCourses[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mutableCourses[index];
}

export function createDemoModule(data: Module): Module {
  mutableModules.push(data);
  return data;
}

export function createDemoLesson(data: Lesson): Lesson {
  mutableLessons.push(data);
  return data;
}

export function updateDemoLesson(
  id: string,
  updates: Partial<Lesson>,
): Lesson | null {
  const index = mutableLessons.findIndex((item) => item.id === id);
  if (index === -1) return null;
  mutableLessons[index] = {
    ...mutableLessons[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mutableLessons[index];
}

export function createDemoQuizWithQuestions(input: {
  quiz: Quiz;
  questions: Array<{
    question: QuizQuestion;
    options: QuizOption[];
  }>;
}): Quiz {
  mutableQuizzes.push(input.quiz);
  for (const item of input.questions) {
    mutableQuizQuestions.push(item.question);
    mutableQuizOptions.push(...item.options);
  }
  return input.quiz;
}

export function deleteDemoQuizzesForCourse(courseId: string): void {
  const lessonIds = getOrderedLessonsForCourse(courseId).map((lesson) => lesson.id);
  const quizIds = mutableQuizzes
    .filter((quiz) => lessonIds.includes(quiz.lesson_id))
    .map((quiz) => quiz.id);

  for (const quizId of quizIds) {
    const questionIds = mutableQuizQuestions
      .filter((question) => question.quiz_id === quizId)
      .map((question) => question.id);

    for (let index = mutableQuizOptions.length - 1; index >= 0; index -= 1) {
      if (questionIds.includes(mutableQuizOptions[index].question_id)) {
        mutableQuizOptions.splice(index, 1);
      }
    }

    for (let index = mutableQuizQuestions.length - 1; index >= 0; index -= 1) {
      if (mutableQuizQuestions[index].quiz_id === quizId) {
        mutableQuizQuestions.splice(index, 1);
      }
    }

    const quizIndex = mutableQuizzes.findIndex((quiz) => quiz.id === quizId);
    if (quizIndex >= 0) {
      mutableQuizzes.splice(quizIndex, 1);
    }
  }
}

export function updateDemoUserRole(userId: string, role: UserRole): DemoUserSession | null {
  return updateDemoUser(userId, { role });
}

export interface AdminMetrics {
  publishedCourses: number;
  draftCourses: number;
  totalLessons: number;
  publishedLessons: number;
  totalProducts: number;
  learners: number;
  activeEnrollments: number;
  completions: number;
  certificatesIssued: number;
}

export function getAdminMetrics(): AdminMetrics {
  const publishedCourses = mutableCourses.filter((c) => c.published).length;
  const draftCourses = mutableCourses.filter((c) => !c.published).length;
  const publishedLessons = mutableLessons.filter((l) => l.published).length;
  const enrollmentList = [...enrollments.values()];

  return {
    publishedCourses,
    draftCourses,
    totalLessons: mutableLessons.length,
    publishedLessons,
    totalProducts: mutableProducts.length,
    learners: demoUsers.size,
    activeEnrollments: enrollmentList.filter((e) => e.status === "active").length,
    completions: enrollmentList.filter((e) => e.status === "completed").length,
    certificatesIssued: certificates.size,
  };
}

export interface CourseEnrollmentStat {
  courseId: string;
  courseTitle: string;
  enrollments: number;
  completions: number;
  completionRate: number;
}

export interface QuizPassStat {
  quizId: string;
  quizTitle: string;
  attempts: number;
  passRate: number;
}

export interface AnalyticsSummary {
  enrollmentStats: CourseEnrollmentStat[];
  quizPassStats: QuizPassStat[];
  totalEnrollments: number;
  totalCompletions: number;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const enrollmentList = [...enrollments.values()];
  const courseStats = mutableCourses.map((course) => {
    const courseEnrollments = enrollmentList.filter(
      (e) => e.course_id === course.id,
    );
    const completions = courseEnrollments.filter(
      (e) => e.status === "completed",
    ).length;
    const enrollments = courseEnrollments.length;

    return {
      courseId: course.id,
      courseTitle: course.title,
      enrollments,
      completions,
      completionRate:
        enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
    };
  });

  const quizPassStats = mutableQuizzes.map((quiz) => {
    const attempts = [...quizAttempts.values()].filter(
      (a) => a.quiz_id === quiz.id,
    );
    const passed = attempts.filter((a) => a.passed).length;

    return {
      quizId: quiz.id,
      quizTitle: quiz.title,
      attempts: attempts.length,
      passRate:
        attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0,
    };
  });

  return {
    enrollmentStats: courseStats,
    quizPassStats,
    totalEnrollments: enrollmentList.length,
    totalCompletions: enrollmentList.filter((e) => e.status === "completed")
      .length,
  };
}

export interface LearnerCourseProgress {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  status: Enrollment["status"];
  percent: number;
  completedRequired: number;
  totalRequired: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  quizPassed: boolean | null;
  enrolledAt: string;
  completedAt: string | null;
}

export interface LearnerQuizAttemptSummary {
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface LearnerAnalyticsSummary {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  company: string | null;
  jobTitle: string | null;
  enrolledCourses: number;
  inProgressCourses: number;
  completedCourses: number;
  averageProgress: number;
  quizAttempts: number;
  quizzesPassed: number;
  certificates: number;
  lastActivityAt: string | null;
}

export interface LearnerAnalyticsDetail extends LearnerAnalyticsSummary {
  courses: LearnerCourseProgress[];
  quizAttemptsList: LearnerQuizAttemptSummary[];
}

function getLearnerCourseProgress(
  userId: string,
  enrollment: Enrollment,
): LearnerCourseProgress | null {
  const course = getCourseById(enrollment.course_id);
  if (!course) return null;

  const summary = getCourseProgress(userId, course.id);
  const quizzes = getQuizzesForCourse(course.id);
  const quizPassed =
    quizzes.length === 0
      ? null
      : quizzes.every((quiz) =>
          getDemoQuizAttempts(userId, quiz.id).some((attempt) => attempt.passed),
        );

  return {
    courseId: course.id,
    courseTitle: course.title,
    courseSlug: course.slug,
    status: enrollment.status,
    percent: summary.percent,
    completedRequired: summary.completedRequired,
    totalRequired: summary.totalRequired,
    completedLessons: summary.completedLessons,
    totalLessons: summary.totalLessons,
    completedQuizzes: summary.completedQuizzes,
    totalQuizzes: summary.totalQuizzes,
    quizPassed,
    enrolledAt: enrollment.enrolled_at,
    completedAt: enrollment.completed_at,
  };
}

function buildLearnerAnalyticsSummary(
  user: DemoUserSession,
): LearnerAnalyticsSummary {
  const userEnrollments = getDemoEnrollments(user.id);
  const courses = userEnrollments
    .map((enrollment) => getLearnerCourseProgress(user.id, enrollment))
    .filter((item): item is LearnerCourseProgress => item !== null);

  const completedCourses = courses.filter(
    (item) => item.status === "completed" || item.percent >= 100,
  ).length;
  const inProgressCourses = courses.filter(
    (item) => item.status !== "completed" && item.percent > 0 && item.percent < 100,
  ).length;
  const averageProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((sum, item) => sum + item.percent, 0) / courses.length,
        )
      : 0;

  const attempts = getDemoQuizAttempts(user.id);
  const passedQuizIds = new Set(
    attempts.filter((attempt) => attempt.passed).map((attempt) => attempt.quiz_id),
  );

  const progressTimes = getDemoLessonProgressForUser(user.id).map(
    (item) => item.updated_at,
  );
  const enrollmentTimes = userEnrollments.map((item) => item.enrolled_at);
  const attemptTimes = attempts.map((item) => item.attempted_at);
  const lastActivityAt =
    [...progressTimes, ...enrollmentTimes, ...attemptTimes].sort().at(-1) ??
    null;

  return {
    userId: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    company: user.company ?? null,
    jobTitle: user.job_title ?? null,
    enrolledCourses: courses.length,
    inProgressCourses,
    completedCourses,
    averageProgress,
    quizAttempts: attempts.length,
    quizzesPassed: passedQuizIds.size,
    certificates: getDemoCertificates(user.id).length,
    lastActivityAt,
  };
}

export function getLearnerAnalyticsSummaries(): LearnerAnalyticsSummary[] {
  return getAllDemoUsers()
    .map(buildLearnerAnalyticsSummary)
    .sort((a, b) => {
      if (b.enrolledCourses !== a.enrolledCourses) {
        return b.enrolledCourses - a.enrolledCourses;
      }
      return (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? "");
    });
}

export function getLearnerAnalyticsDetail(
  userId: string,
): LearnerAnalyticsDetail | null {
  const user = getDemoUserById(userId);
  if (!user) return null;

  const summary = buildLearnerAnalyticsSummary(user);
  const courses = getDemoEnrollments(userId)
    .map((enrollment) => getLearnerCourseProgress(userId, enrollment))
    .filter((item): item is LearnerCourseProgress => item !== null)
    .sort((a, b) => b.percent - a.percent);

  const quizAttemptsList = getDemoQuizAttempts(userId)
    .map((attempt) => {
      const quiz = mutableQuizzes.find((item) => item.id === attempt.quiz_id);
      const lesson = quiz ? getLessonById(quiz.lesson_id) : null;
      const course = lesson ? getCourseForModuleId(lesson.module_id) : null;
      return {
        quizId: attempt.quiz_id,
        quizTitle: quiz?.title ?? "Quiz",
        courseTitle: course?.title ?? "Course",
        score: attempt.score,
        passed: attempt.passed,
        attemptedAt: attempt.attempted_at,
      };
    })
    .sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt));

  return {
    ...summary,
    courses,
    quizAttemptsList,
  };
}

export interface ContentHealthIssue {
  type: "lesson_no_video" | "course_no_thumbnail" | "unpublished_lesson" | "draft_course";
  entityId: string;
  title: string;
  detail: string;
  href: string;
}

export function getContentHealthIssues(): ContentHealthIssue[] {
  const issues: ContentHealthIssue[] = [];

  for (const lesson of mutableLessons) {
    if (!lesson.video_url && lesson.video_provider === "placeholder") {
      const courseModule = mutableModules.find((m) => m.id === lesson.module_id);
      const course = courseModule
        ? mutableCourses.find((c) => c.id === courseModule.course_id)
        : undefined;
      issues.push({
        type: "lesson_no_video",
        entityId: lesson.id,
        title: lesson.title,
        detail: course ? `In ${course.title}` : "Missing video",
        href: `/admin/lessons/${lesson.id}`,
      });
    }

    if (!lesson.published) {
      issues.push({
        type: "unpublished_lesson",
        entityId: lesson.id,
        title: lesson.title,
        detail: "Lesson is not published",
        href: `/admin/lessons/${lesson.id}`,
      });
    }
  }

  for (const course of mutableCourses) {
    if (!course.thumbnail_url) {
      issues.push({
        type: "course_no_thumbnail",
        entityId: course.id,
        title: course.title,
        detail: "No thumbnail image",
        href: `/admin/courses/${course.id}`,
      });
    }

    if (!course.published) {
      issues.push({
        type: "draft_course",
        entityId: course.id,
        title: course.title,
        detail: "Course is in draft",
        href: `/admin/courses/${course.id}`,
      });
    }
  }

  return issues;
}

export function getAllDemoQuizzes(): Quiz[] {
  return [...mutableQuizzes];
}

export function getNextLearningItemForUser(userId: string): {
  kind: "lesson" | "quiz";
  title: string;
  courseTitle: string;
  moduleTitle: string;
  href: string;
  courseId: string;
} | null {
  const userEnrollments = getDemoEnrollments(userId);

  for (const enrollment of userEnrollments) {
    if (enrollment.status === "completed") continue;

    const course = getCourseById(enrollment.course_id);
    if (!course) continue;

    const summary = getCourseProgress(userId, course.id);
    if (summary.percent >= 100) continue;

    const courseModules = getModulesByCourseId(course.id);
    for (const courseModule of courseModules) {
      for (const lesson of getLessonsForModule(courseModule.id)) {
        if (!lesson.published || !lesson.required) continue;
        const progress = getDemoLessonProgress(userId, lesson.id);
        if (!progress?.completed) {
          return {
            kind: "lesson",
            title: lesson.title,
            courseTitle: course.title,
            moduleTitle: courseModule.title,
            href: `/courses/${course.slug}/lesson/${lesson.slug}`,
            courseId: course.id,
          };
        }
      }
    }

    if (!hasPassedCourseQuiz(userId, course.id)) {
      const quiz = getCourseQuizWithQuestions(course.id);
      return {
        kind: "quiz",
        title: quiz?.title ?? "Course quiz",
        courseTitle: course.title,
        moduleTitle: "Knowledge check",
        href: `/courses/${course.slug}/quiz`,
        courseId: course.id,
      };
    }
  }

  return null;
}

export function getNextLessonForUser(userId: string) {
  const next = getNextLearningItemForUser(userId);
  if (!next || next.kind !== "lesson") {
    return null;
  }

  const match = next.href.match(/\/courses\/([^/]+)\/lesson\/([^/]+)/);
  if (!match) return null;
  return getLessonBySlugs(match[1], match[2]);
}

export function getRecommendedCoursesForUser(
  userId: string,
  limit = 4,
): Course[] {
  const user = getDemoUserById(userId);
  const enrolledIds = new Set(
    getDemoEnrollments(userId).map((e) => e.course_id),
  );

  let candidates = getCourses({ publishedOnly: true });

  if (user?.preferred_product_ids?.length) {
    const preferred = candidates.filter((c) =>
      user.preferred_product_ids!.includes(c.product_id),
    );
    if (preferred.length > 0) {
      candidates = preferred;
    }
  } else if (user?.learning_role) {
    const roleProductMap: Partial<Record<LearningRole, string[]>> = {
      sales_representative: [
        "11111111-1111-1111-1111-111111111101",
        "11111111-1111-1111-1111-111111111103",
        "11111111-1111-1111-1111-111111111109",
      ],
      sales_manager: [
        "11111111-1111-1111-1111-111111111108",
        "11111111-1111-1111-1111-111111111103",
      ],
      operations: [
        "11111111-1111-1111-1111-111111111104",
        "11111111-1111-1111-1111-111111111105",
        "11111111-1111-1111-1111-111111111109",
      ],
      administrator: [
        "11111111-1111-1111-1111-111111111101",
        "11111111-1111-1111-1111-111111111108",
      ],
    };

    const productIds = roleProductMap[user.learning_role];
    if (productIds?.length) {
      const matched = candidates.filter((c) => productIds.includes(c.product_id));
      if (matched.length > 0) {
        candidates = matched;
      }
    }
  }

  return candidates
    .filter((c) => !enrolledIds.has(c.id))
    .slice(0, limit);
}

seedDemoAdminAccount();
seedDemoLearners();

function addSeedLearner(input: {
  id: string;
  email: string;
  full_name: string;
  company: string;
  job_title: string;
  learning_role: LearningRole;
}): DemoUserSession {
  const existing = demoUsers.get(input.email);
  if (existing) {
    const { password: _password, ...session } = existing;
    return session;
  }

  const now = "2026-09-10T09:00:00.000Z";
  const registered: DemoRegisteredUser = {
    id: input.id,
    email: input.email,
    password: "demo",
    full_name: input.full_name,
    role: "customer",
    company: input.company,
    job_title: input.job_title,
    learning_role: input.learning_role,
    preferred_product_ids: null,
    onboarding_completed: true,
    avatar_url: null,
    created_at: now,
    updated_at: now,
  };
  demoUsers.set(input.email, registered);
  const { password: _password, ...session } = registered;
  return session;
}

function markCourseLessonsComplete(
  userId: string,
  courseId: string,
  count?: number,
) {
  const lessons = getOrderedLessonsForCourse(courseId);
  const selected = count == null ? lessons : lessons.slice(0, count);

  for (const lesson of selected) {
    upsertDemoLessonProgress({
      userId,
      lessonId: lesson.id,
      lastPosition: lesson.duration_seconds,
      watchedSeconds: lesson.duration_seconds,
      completed: true,
    });
  }
}

function passCourseQuiz(userId: string, courseId: string, score: number) {
  const quizzes = getQuizzesForCourse(courseId);
  for (const quiz of quizzes) {
    addDemoQuizAttempt({
      user_id: userId,
      quiz_id: quiz.id,
      score,
      passed: score >= quiz.passing_score,
      answers: {},
      attempted_at: "2026-09-18T14:30:00.000Z",
    });
  }
}

function seedDemoLearners() {
  if (demoUsers.has("amina.saleh@maxproinfotech.com")) {
    return;
  }

  const rockeyId = "22222222-2222-2222-2222-222222222201";
  const pharmaId = "22222222-2222-2222-2222-222222222203";
  const agroId = "22222222-2222-2222-2222-222222222204";
  const calculusId = PLAYLIST_TEST_COURSE_ID;

  const amina = addSeedLearner({
    id: "demo-learner-00000000-0000-0000-0000-000000000011",
    email: "amina.saleh@maxproinfotech.com",
    full_name: "Amina Saleh",
    company: "Maxpro Infotech",
    job_title: "Sales Representative",
    learning_role: "sales_representative",
  });
  enrollDemoUser(amina.id, rockeyId);
  markCourseLessonsComplete(amina.id, rockeyId);
  passCourseQuiz(amina.id, rockeyId, 85);
  completeDemoEnrollment(amina.id, rockeyId);
  issueDemoCertificate({
    id: "demo-certificate-amina-rockey",
    userId: amina.id,
    courseId: rockeyId,
    certificateNumber: "MAXPRO-ACADEMY-000101",
    verificationToken: "demo-cert-amina-rockey",
    issuedAt: "2026-09-18T14:30:00.000Z",
  });
  enrollDemoUser(amina.id, calculusId);
  markCourseLessonsComplete(amina.id, calculusId, 4);

  const karim = addSeedLearner({
    id: "demo-learner-00000000-0000-0000-0000-000000000012",
    email: "karim.nasser@maxproinfotech.com",
    full_name: "Karim Nasser",
    company: "Maxpro Infotech",
    job_title: "Sales Manager",
    learning_role: "sales_manager",
  });
  enrollDemoUser(karim.id, rockeyId);
  markCourseLessonsComplete(karim.id, rockeyId, 3);
  enrollDemoUser(karim.id, pharmaId);

  const sara = addSeedLearner({
    id: "demo-learner-00000000-0000-0000-0000-000000000013",
    email: "sara.haddad@maxproinfotech.com",
    full_name: "Sara Haddad",
    company: "Green Fields Co.",
    job_title: "Operations Lead",
    learning_role: "operations",
  });
  enrollDemoUser(sara.id, agroId);
  markCourseLessonsComplete(sara.id, agroId);
  passCourseQuiz(sara.id, agroId, 92);
  completeDemoEnrollment(sara.id, agroId);
  issueDemoCertificate({
    id: "demo-certificate-sara-agro",
    userId: sara.id,
    courseId: agroId,
    certificateNumber: "MAXPRO-ACADEMY-000102",
    verificationToken: "demo-cert-sara-agro",
    issuedAt: "2026-09-16T11:00:00.000Z",
  });
  enrollDemoUser(sara.id, rockeyId);
  markCourseLessonsComplete(sara.id, rockeyId, 8);
  enrollDemoUser(sara.id, calculusId);
}
