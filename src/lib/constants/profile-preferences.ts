export const DEFAULT_PROFILE_TIMEZONE = "Africa/Nairobi";
export const DEFAULT_PROFILE_LOCALE = "en_US";

export const PROFILE_TIMEZONES = [
  { value: "Africa/Nairobi", label: "Nairobi" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "UTC", label: "UTC" },
] as const;

export const PROFILE_LOCALES = [
  { value: "en_US", label: "en_US" },
  { value: "en_GB", label: "en_GB" },
  { value: "ar_EG", label: "ar_EG" },
  { value: "fr_FR", label: "fr_FR" },
  { value: "sw_KE", label: "sw_KE" },
] as const;
