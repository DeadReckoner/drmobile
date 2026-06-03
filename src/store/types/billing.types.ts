/**
 * Types for the backend Free/Paid plan-gating contract.
 * See BILLING_API_CONTRACT.md §2 (status response) and §3 (402 body).
 */

export type PlanType = 'free' | 'paid';

export type BillingSourceType =
  | 'default'
  | 'apple'
  | 'google'
  | 'stripe'
  | 'comp';

export type BillingSubStatusType =
  | 'active'
  | 'trialing'
  | 'in_grace'
  | 'cancelled'
  | 'expired'
  | null;

export type BillingProductIdType = 'dr_pro_monthly' | 'dr_pro_annual';

/**
 * Stable keys the 402 contract keys off (§3). Includes Step-8-pending
 * features — codes are stable so UI can be wired ahead of the backend.
 */
export type FeatureKeyType =
  | 'active_roadmaps'
  | 'active_habits'
  | 'roadmap_anchors'
  | 'habit_anchors'
  | 'ai_generations_per_month'
  | 'archive'
  | 'custom_reminders'
  | 'weekly_review'
  | 'messaging_reactions'
  | 'anchor_settings'
  | 'advanced_stats'
  | 'historical_performance';

/** `-1` means unlimited (render as "unlimited", not "−1"). */
export type BillingLimits = {
  active_roadmaps: number;
  active_habits: number;
  anchors_per_roadmap: number;
  ai_generations_per_month: number;
};

export type BillingUsage = {
  active_roadmaps: number;
  active_habits: number;
  ai_generations_this_period: number;
};

export type BillingStatusResponse = {
  plan: PlanType;
  source: BillingSourceType;
  status?: BillingSubStatusType;
  trial_ends_at?: string;
  renews_at?: string;
  product_id?: BillingProductIdType;
  limits: BillingLimits;
  usage: BillingUsage;
};

/** The HTTP 402 body returned by gated endpoints (§3). */
export type PlanLimitError = {
  code: 'plan_limit';
  feature: FeatureKeyType;
  limit: number;
  current: number;
  message: string;
};

/** Subset of the 402 body used to drive the paywall modal. */
export type PaywallTriggerType = {
  feature: FeatureKeyType;
  limit: number;
  current: number;
} | null;
