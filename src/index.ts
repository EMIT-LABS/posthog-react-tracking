/**
 * React (web) PostHog tracking library.
 * API aligned with posthog_service: PosthogProvider + usePosthog() with full tracking, feature flags, and consent.
 */

export { PosthogProvider, PosthogContext } from './PosthogProvider';
export { usePosthog } from './usePosthog';
export * from './constants';
export type { PosthogProviderProps, Posthog, TrackEvent } from './types';
