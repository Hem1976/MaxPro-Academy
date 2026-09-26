/**
 * Syncs in-app demo catalog + demo accounts into Supabase.
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-supabase-demo-full.ts
 */
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  getAllDemoQuizzes,
  getAllLessons,
  getCourses,
  getDemoAdminEmail,
  getDemoCertificates,
  getDemoEnrollments,
  getDemoLessonProgressForUser,
  getDemoQuizAttempts,
  getDemoUser,
  getModulesByCourseId,
  getProducts,
  getQuizById,
} from "../src/lib/data/demo-store";

const DEMO_LEARNER_PASSWORD = "demo1234";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD?.trim() || "demo1234";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Demo quiz option ids like `opt-601-1` → deterministic UUID for Postgres. */
function toDbUuid(seed: string): string {
  if (UUID_RE.test(seed)) return seed;
  const hash = createHash("sha256").update(`maxacademy:${seed}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function upsertTable<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  onConflict = "id",
) {
  if (rows.length === 0) return;
  const { error } = await admin.from(table).upsert(rows, { onConflict });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  console.log(`upsert ${table}:`, rows.length);
}

async function syncCatalog() {
  const products = getProducts({ publishedOnly: false });
  await upsertTable(
    "products",
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      short_description: p.short_description,
      description: p.description,
      logo_url: p.logo_url,
      cover_image_url: p.cover_image_url,
      category: p.category,
      published: p.published,
      featured: p.featured,
      sort_order: p.sort_order,
      created_at: p.created_at,
      updated_at: p.updated_at,
    })),
  );

  const courses = getCourses({ publishedOnly: false });
  await upsertTable(
    "courses",
    courses.map((c) => ({
      id: c.id,
      product_id: c.product_id,
      course_kind: c.course_kind ?? "internal",
      title: c.title,
      slug: c.slug,
      description: c.description,
      short_description: c.short_description,
      thumbnail_url: c.thumbnail_url,
      level: c.level,
      estimated_minutes: c.estimated_minutes,
      published: c.published,
      featured: c.featured,
      certificate_enabled: c.certificate_enabled,
      sort_order: c.sort_order,
      learning_outcomes: c.learning_outcomes,
      status: c.status,
      version: c.version,
      last_reviewed_at: c.last_reviewed_at,
      review_status: c.review_status,
      created_at: c.created_at,
      updated_at: c.updated_at,
    })),
  );

  const modules = courses.flatMap((c) => getModulesByCourseId(c.id));
  await upsertTable(
    "modules",
    modules.map((m) => ({
      id: m.id,
      course_id: m.course_id,
      title: m.title,
      description: m.description,
      sort_order: m.sort_order,
      created_at: m.created_at,
      updated_at: m.updated_at,
    })),
  );

  const lessons = getAllLessons();
  await upsertTable(
    "lessons",
    lessons.map((l) => ({
      id: l.id,
      module_id: l.module_id,
      title: l.title,
      slug: l.slug,
      description: l.description,
      learning_objective: l.learning_objective,
      video_provider: l.video_provider,
      video_id: l.video_id,
      video_url: l.video_url,
      duration_seconds: l.duration_seconds,
      thumbnail_url: l.thumbnail_url,
      transcript: l.transcript,
      written_content: l.written_content,
      captions_url: l.captions_url,
      processing_status: l.processing_status,
      published: l.published,
      required: l.required,
      sort_order: l.sort_order,
      version: l.version,
      last_reviewed_at: l.last_reviewed_at,
      review_status: l.review_status,
      created_at: l.created_at,
      updated_at: l.updated_at,
    })),
  );

  const quizzes = getAllDemoQuizzes();
  await upsertTable(
    "quizzes",
    quizzes.map((q) => ({
      id: q.id,
      lesson_id: q.lesson_id,
      title: q.title,
      description: q.description,
      passing_score: q.passing_score,
      required: q.required,
      created_at: q.created_at,
      updated_at: q.updated_at,
    })),
  );

  const questions: Record<string, unknown>[] = [];
  const options: Record<string, unknown>[] = [];
  for (const quiz of quizzes) {
    const full = getQuizById(quiz.id);
    if (!full) continue;
    for (const question of full.questions) {
      questions.push({
        id: question.id,
        quiz_id: question.quiz_id,
        question: question.question,
        explanation: question.explanation,
        sort_order: question.sort_order,
        created_at: question.created_at,
      });
      for (const option of question.options) {
        options.push({
          id: toDbUuid(option.id),
          question_id: option.question_id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        });
      }
    }
  }
  await upsertTable("quiz_questions", questions);
  await upsertTable("quiz_options", options);
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function ensureAuthUser(input: {
  email: string;
  password: string;
  full_name: string;
  role: "customer" | "super_admin";
  learning_role?: string | null;
  company?: string | null;
  job_title?: string | null;
  onboarding_completed?: boolean;
}): Promise<string> {
  const email = input.email.toLowerCase();
  let userId = await findUserIdByEmail(email);

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name },
    });
    if (error) throw new Error(`create ${email}: ${error.message}`);
    userId = data.user?.id ?? null;
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: input.password,
    });
    if (error) throw new Error(`password ${email}: ${error.message}`);
  }

  if (!userId) throw new Error(`No user id for ${email}`);

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: input.full_name,
      role: input.role,
      company: input.company ?? null,
      job_title: input.job_title ?? null,
      learning_role: input.learning_role ?? null,
      onboarding_completed: input.onboarding_completed ?? true,
      is_active: true,
    },
    { onConflict: "id" },
  );
  if (profileError) throw new Error(`profile ${email}: ${profileError.message}`);

  return userId;
}

const DEMO_LEARNERS = [
  {
    email: "amina.saleh@maxproinfotech.com",
    full_name: "Amina Saleh",
    company: "Maxpro Infotech",
    job_title: "Sales Representative",
    learning_role: "sales_representative",
  },
  {
    email: "karim.nasser@maxproinfotech.com",
    full_name: "Karim Nasser",
    company: "Maxpro Infotech",
    job_title: "Sales Manager",
    learning_role: "sales_manager",
  },
  {
    email: "sara.haddad@maxproinfotech.com",
    full_name: "Sara Haddad",
    company: "Green Fields Co.",
    job_title: "Operations Lead",
    learning_role: "operations",
  },
] as const;

async function syncDemoUsersAndProgress() {
  const adminEmail = getDemoAdminEmail();
  const adminId = await ensureAuthUser({
    email: adminEmail,
    password: ADMIN_PASSWORD,
    full_name: "Maxpro Academy Admin",
    role: "super_admin",
    onboarding_completed: true,
  });
  console.log("admin user:", adminEmail, adminId);

  const emailToAuthId = new Map<string, string>();
  for (const learner of DEMO_LEARNERS) {
    const id = await ensureAuthUser({
      email: learner.email,
      password: DEMO_LEARNER_PASSWORD,
      full_name: learner.full_name,
      role: "customer",
      company: learner.company,
      job_title: learner.job_title,
      learning_role: learner.learning_role,
      onboarding_completed: true,
    });
    emailToAuthId.set(learner.email, id);
    console.log("learner:", learner.email, id);
  }

  for (const learner of DEMO_LEARNERS) {
    const demoUser = getDemoUser(learner.email);
    const authId = emailToAuthId.get(learner.email);
    if (!demoUser || !authId) continue;

    const enrollments = getDemoEnrollments(demoUser.id);
    if (enrollments.length > 0) {
      const { error } = await admin.from("enrollments").upsert(
        enrollments.map((enrollment) => ({
          user_id: authId,
          course_id: enrollment.course_id,
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
        })),
        { onConflict: "user_id,course_id" },
      );
      if (error) throw new Error(`enrollments: ${error.message}`);
      console.log(`enrollments for ${learner.email}:`, enrollments.length);
    }

    const progress = getDemoLessonProgressForUser(demoUser.id);
    if (progress.length > 0) {
      const { error } = await admin.from("lesson_progress").upsert(
        progress.map((p) => ({
          user_id: authId,
          lesson_id: p.lesson_id,
          last_position: p.last_position,
          watched_seconds: p.watched_seconds,
          completed: p.completed,
          completed_at: p.completed_at,
          updated_at: p.updated_at,
        })),
        { onConflict: "user_id,lesson_id" },
      );
      if (error) throw new Error(`lesson_progress: ${error.message}`);
      console.log(`lesson_progress for ${learner.email}:`, progress.length);
    }

    const quizzes = getAllDemoQuizzes();
    for (const quiz of quizzes) {
      const attempts = getDemoQuizAttempts(demoUser.id, quiz.id);
      if (attempts.length > 0) {
        await upsertTable(
          "quiz_attempts",
          attempts.map((a) => ({
            id: a.id,
            user_id: authId,
            quiz_id: a.quiz_id,
            score: a.score,
            passed: a.passed,
            answers: a.answers,
            attempted_at: a.attempted_at,
          })),
        );
      }
    }
  }

  for (const learner of DEMO_LEARNERS) {
    const demoUser = getDemoUser(learner.email);
    const authId = emailToAuthId.get(learner.email);
    if (!demoUser || !authId) continue;

    const certs = getDemoCertificates(demoUser.id);
    if (certs.length === 0) continue;

    await upsertTable(
      "certificates",
      certs.map((cert) => ({
        id: toDbUuid(cert.id),
        user_id: authId,
        course_id: cert.course_id,
        certificate_number: cert.certificate_number,
        verification_token: cert.verification_token,
        issued_at: cert.issued_at,
        pdf_url: cert.pdf_url,
      })),
    );
  }
}

async function main() {
  console.log("Syncing catalog…");
  await syncCatalog();
  console.log("Syncing demo users, enrollments, progress…");
  await syncDemoUsersAndProgress();
  console.log("Done.");
  console.log("");
  console.log("Demo logins (Supabase):");
  console.log(`  Admin: ${getDemoAdminEmail()} / ${ADMIN_PASSWORD}`);
  console.log(`  Learners: *@maxproinfotech.com / ${DEMO_LEARNER_PASSWORD}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
