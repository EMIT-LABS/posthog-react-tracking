/**
 * React (web) PostHog tracking library.
 * API aligned with posthog_service: PosthogProvider + usePosthog() with full tracking, feature flags, and consent.
 */

export { PosthogProvider, PosthogContext } from './PosthogProvider';
export { usePosthog } from './usePosthog';
export { usePosthogSessionReplay } from './usePosthogSessionReplay';
export { PosthogSessionReplayStarter } from './PosthogSessionReplayStarter';
export * from './constants';
export type { PosthogProviderProps, Posthog, TrackEvent, SessionReplayConfig } from './types';
export type { PosthogSessionReplayAPI } from './usePosthogSessionReplay';
