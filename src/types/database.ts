export type UserRole = "customer" | "trainer" | "content_admin" | "super_admin";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

/** Internal = built-in lessons/videos; external = questionnaire-led third-party training */
export type CourseKind = "internal" | "external";

export type EnrollmentStatus = "active" | "completed" | "archived";

export type PublishStatus = "draft" | "published" | "archived";

export type VideoProviderName =
  | "external"
  | "youtube"
  | "vimeo"
  | "mux"
  | "cloudflare"
  | "placeholder";

export type VideoProcessingStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

export type ResourceType =
  | "pdf"
  | "doc"
  | "image"
  | "link"
  | "spreadsheet"
  | "other";

export type LearningRole =
  | "sales_representative"
  | "sales_manager"
  | "administrator"
  | "operations"
  | "business_owner"
  | "trainer";

export type ReviewStatus = "current" | "needs_review" | "outdated";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  company: string | null;
  job_title: string | null;
  phone: string | null;
  timezone: string | null;
  locale: string | null;
  learning_role: LearningRole | null;
  preferred_product_ids: string[] | null;
  onboarding_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  product_id: string;
  course_kind?: CourseKind;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  level: CourseLevel;
  estimated_minutes: number;
  published: boolean;
  featured: boolean;
  certificate_enabled: boolean;
  sort_order: number;
  learning_outcomes: string[] | null;
  status: PublishStatus;
  version: string | null;
  last_reviewed_at: string | null;
  review_status: ReviewStatus;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  learning_objective: string | null;
  video_provider: VideoProviderName;
  video_id: string | null;
  video_url: string | null;
  duration_seconds: number;
  thumbnail_url: string | null;
  transcript: string | null;
  written_content: string | null;
  captions_url: string | null;
  processing_status: VideoProcessingStatus;
  published: boolean;
  required: boolean;
  sort_order: number;
  version: string | null;
  last_reviewed_at: string | null;
  review_status: ReviewStatus;
  created_at: string;
  updated_at: string;
  module?: Module;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  file_url: string;
  resource_type: ResourceType;
  created_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  required: boolean;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  explanation: string | null;
  sort_order: number;
  created_at: string;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  watched_seconds: number;
  completed: boolean;
  completed_at: string | null;
  last_position: number;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  status: EnrollmentStatus;
  course?: Course;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  attempted_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  verification_token: string;
  pdf_url: string | null;
  course?: Course;
  profile?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  published: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_name: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AppSettings {
  id: string;
  support_email: string | null;
  support_url: string | null;
  watch_completion_threshold: number;
  updated_at: string;
}
