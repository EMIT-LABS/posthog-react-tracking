import type React from 'react';

export interface PosthogProviderProps {
  /** PostHog project API key (e.g. phc_...) */
  apiKey: string;
  /** PostHog host (e.g. https://eu.i.posthog.com). Defaults to DEFAULT_HOST from constants. */
  host?: string;
  /** Enable debug logs */
  debug?: boolean;
  /** Disable autocapture */
  autocapture?: boolean;
  /** Disable GeoIP resolution */
  disableGeoip?: boolean;
  /** Additional options passed to posthog.init() */
  options?: Record<string, unknown>;
  children: React.ReactNode;
}

/** Event shape for track() — supports $screen_name and $current_url in properties */
export interface TrackEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

/** Return type of usePosthog() — matches posthog_service API surface */
export interface Posthog {
  track: (event: TrackEvent) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  setUserProperties: (properties: Record<string, unknown>) => void;
  setUserPropertiesOnce: (properties: Record<string, unknown>) => void;
  reset: () => void;
  register: (properties?: Record<string, unknown>) => void;
  unregister: (property: string) => void;
  flush: () => Promise<void>;
  optIn: () => void;
  optOut: () => void;
  isOptedOut: () => boolean;
  isFeatureEnabled: (flagKey: string) => boolean | undefined;
  getFeatureFlag: (flagKey: string) => string | boolean | undefined;
  getFeatureFlagPayload: (flagKey: string) => unknown;
  reloadFeatureFlags: () => void;
  reloadFeatureFlagsAsync: () => Promise<string[]>;
  onFeatureFlags: (callback: (flags: Record<string, string | boolean>) => void) => () => void;
  setPersonPropertiesForFlags: (properties: Record<string, unknown>, reloadFlags?: boolean) => void;
  resetPersonPropertiesForFlags: () => void;
  isInitialized: boolean;
}
