import { getDemoAdminEmail, isSupabaseConfigured } from "@/lib/data/demo-store";
import { isPostmarkConfigured } from "@/lib/email/postmark";
import { getAppPublicUrl } from "@/lib/email/postmark-config";
import { WATCH_COMPLETION_THRESHOLD } from "@/lib/progress/calculate";

export function getPlatformSettingsSnapshot() {
  return {
    dataMode: isSupabaseConfigured() ? "live" : "demo",
    emailsEnabled: isPostmarkConfigured(),
    appUrl: getAppPublicUrl(),
    watchCompletionPercent: WATCH_COMPLETION_THRESHOLD,
    demoAdminEmail: getDemoAdminEmail(),
  };
}
