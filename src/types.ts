/** Slug from UserCategory (built-in: social, work, … or custom c_…) */
export type CategorySlug = string;

export interface UserCategoryDto {
  slug: CategorySlug;
  name: string;
  colorIndex: number;
  isBuiltIn: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: CategorySlug;
  estimatedCostUsd?: number;
}

/** Built-in slugs used in onboarding ordering */
export const ONBOARDING_SLUGS = [
  "social",
  "work",
  "travel",
  "health",
  "other",
] as const;

export const ONBOARDING_LABELS: Record<(typeof ONBOARDING_SLUGS)[number], string> = {
  social: "Social",
  work: "Work",
  travel: "Travel",
  health: "Health",
  other: "Other",
};
