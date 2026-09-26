import type { LearningRole } from "@/types/database";

export const LEARNING_ROLES: Array<{
  value: LearningRole;
  label: string;
  description: string;
}> = [
  {
    value: "sales_representative",
    label: "Sales Representative",
    description: "Field sales, visits, and order capture workflows.",
  },
  {
    value: "sales_manager",
    label: "Sales Manager",
    description: "Team oversight, reporting, and performance management.",
  },
  {
    value: "administrator",
    label: "Administrator",
    description: "User management, configuration, and system setup.",
  },
  {
    value: "operations",
    label: "Operations",
    description: "Distribution, logistics, and day-to-day operations.",
  },
  {
    value: "business_owner",
    label: "Business Owner",
    description: "Executive overview and strategic product adoption.",
  },
  {
    value: "trainer",
    label: "Trainer",
    description: "Enable teams and deliver structured product training.",
  },
];

export function learningRoleLabel(role: LearningRole | null | undefined): string {
  if (!role) return "Not set";
  return LEARNING_ROLES.find((item) => item.value === role)?.label ?? role;
}
