/**
 * The client-emittable subset of the product event catalog.
 *
 * Mirrors `analytics/catalog.go` on the server, which rejects anything not on
 * its own allowlist. Keeping this a typed constant rather than accepting free
 * strings means a typo is a TypeScript error here instead of a silently
 * discarded event that nobody notices until a dashboard reads zero.
 *
 * Only events the client can legitimately observe belong here. Signup
 * completion, action completion, and every subscription event are recorded by
 * the server from the actual state change — the client is not trusted to
 * assert facts that decide activation or revenue numbers, and the server
 * rejects them if it tries.
 */
export const AnalyticsEvent = Object.freeze({
  AppFirstOpen: 'app_first_open',
  AppSessionStarted: 'app_session_started',
  SignupStarted: 'signup_started',
  SignupFailed: 'signup_failed',
  LoginFailed: 'login_failed',
  OnboardingStarted: 'onboarding_started',
  OnboardingStepCompleted: 'onboarding_step_completed',

  GoalDiscoveryStarted: 'goal_discovery_started',
  GoalDiscoverySubmitted: 'goal_discovery_submitted',
  GoalOptionsGenerated: 'goal_options_generated',
  GoalOptionSelected: 'goal_option_selected',
  GoalDiscoveryAbandoned: 'goal_discovery_abandoned',

  PushPermissionPrompted: 'push_permission_prompted',
  PushPermissionGranted: 'push_permission_granted',
  PushPermissionDenied: 'push_permission_denied',
  NotificationOpened: 'notification_opened',
  AccountabilityAlertOpened: 'accountability_alert_opened',

  PaywallViewed: 'paywall_viewed',
  CheckoutStarted: 'checkout_started',
} as const);

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Property keys the server's allowlist accepts. Anything else is dropped
 * server-side before storage.
 *
 * Never put user content here — goal titles, notes, messages, prompts, or
 * anything a person typed. The analytics store holds behavior, not content,
 * and it is retained far longer than an operational log.
 */
export type AnalyticsProperties = Partial<
  Record<
    | 'goal_id'
    | 'roadmap_id'
    | 'work_item_id'
    | 'occurrence_id'
    | 'item_type'
    | 'anchor_relationship_id'
    | 'duration_ms'
    | 'outcome'
    | 'error_code'
    | 'notification_type'
    | 'plan_type'
    | 'billing_period'
    | 'source_screen'
    | 'step'
    | 'step_index'
    | 'reason'
    | 'count',
    string | number | boolean
  >
>;
