import { isSupabaseConfigured } from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";

export const ANALYTICS_EVENTS = {
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  VIDEO_STARTED: "video_started",
  VIDEO_COMPLETED: "video_completed",
  COURSE_STARTED: "course_started",
  COURSE_COMPLETED: "course_completed",
  QUIZ_STARTED: "quiz_started",
  QUIZ_COMPLETED: "quiz_completed",
  CERTIFICATE_ISSUED: "certificate_issued",
  SEARCH_PERFORMED: "search_performed",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export interface TrackEventPayload {
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  userId?: string | null;
}

export async function trackEvent(
  eventName: AnalyticsEventName,
  payload: TrackEventPayload = {},
): Promise<void> {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", eventName, payload);
    }
    return;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("analytics_events").insert({
      user_id: payload.userId ?? user?.id ?? null,
      event_name: eventName,
      entity_type: payload.entityType ?? null,
      entity_id: payload.entityId ?? null,
      metadata: payload.metadata ?? {},
    });

    if (error) {
      console.error("[analytics] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[analytics] trackEvent error:", err);
  }
}
