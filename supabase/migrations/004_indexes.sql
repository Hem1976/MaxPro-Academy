-- Maxpro Academy: indexes
-- 004_indexes.sql

create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_published on public.products (published, featured, sort_order);

create index if not exists idx_courses_slug on public.courses (slug);
create index if not exists idx_courses_product_id on public.courses (product_id);
create index if not exists idx_courses_published on public.courses (published, status, featured);

create index if not exists idx_modules_course_id on public.modules (course_id, sort_order);

create index if not exists idx_lessons_module_id on public.lessons (module_id, sort_order);
create index if not exists idx_lessons_slug on public.lessons (slug);
create index if not exists idx_lessons_published on public.lessons (published);

create index if not exists idx_lesson_resources_lesson_id on public.lesson_resources (lesson_id);

create index if not exists idx_quizzes_lesson_id on public.quizzes (lesson_id);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions (quiz_id, sort_order);
create index if not exists idx_quiz_options_question_id on public.quiz_options (question_id, sort_order);

create index if not exists idx_enrollments_user_id on public.enrollments (user_id);
create index if not exists idx_enrollments_course_id on public.enrollments (course_id);
create index if not exists idx_enrollments_status on public.enrollments (status);

create index if not exists idx_lesson_progress_user_id on public.lesson_progress (user_id);
create index if not exists idx_lesson_progress_lesson_id on public.lesson_progress (lesson_id);
create index if not exists idx_lesson_progress_completed on public.lesson_progress (user_id, completed);

create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts (user_id);
create index if not exists idx_quiz_attempts_quiz_id on public.quiz_attempts (quiz_id);

create index if not exists idx_certificates_number on public.certificates (certificate_number);
create index if not exists idx_certificates_token on public.certificates (verification_token);
create index if not exists idx_certificates_user_id on public.certificates (user_id);

create index if not exists idx_notifications_user_id on public.notifications (user_id, read);
create index if not exists idx_analytics_events_name on public.analytics_events (event_name, created_at desc);
create index if not exists idx_analytics_events_user on public.analytics_events (user_id);

create index if not exists idx_lessons_transcript_search on public.lessons using gin (to_tsvector('english', coalesce(transcript, '')));
create index if not exists idx_lessons_content_search on public.lessons using gin (to_tsvector('english', coalesce(written_content, '') || ' ' || coalesce(title, '')));
create index if not exists idx_courses_search on public.courses using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
create index if not exists idx_products_search on public.products using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));
