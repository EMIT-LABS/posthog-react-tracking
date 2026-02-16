import * as posthog_js from 'posthog-js';
import React from 'react';

/** Session replay config (web). Aligns with posthog-js SessionRecordingOptions masking. Use blockSelector: 'img' to mask images. */
interface SessionReplayConfig {
    /** Mask all input fields (equivalent to maskAllTextInputs in React Native) */
    maskAllInputs?: boolean;
    /** CSS selector for elements whose text should be masked */
    maskTextSelector?: string | null;
    /** CSS selector for elements to block from recording (e.g. 'img' to mask images) */
    blockSelector?: string | null;
}
interface PosthogProviderProps {
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
    /** Enable session replay. When false, recording is disabled and you can start it manually with startSessionRecording(). */
    enableSessionReplay?: boolean;
    /** Session replay masking/config. Only used when enableSessionReplay is true. */
    sessionReplayConfig?: SessionReplayConfig;
    /** Additional options passed to posthog.init() */
    options?: Record<string, unknown>;
    children: React.ReactNode;
}
/** Event shape for track() — supports $screen_name and $current_url in properties */
interface TrackEvent {
    name: string;
    properties?: Record<string, unknown>;
    timestamp?: number;
}
/** Return type of usePosthog() — matches posthog_service API surface */
interface Posthog {
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

declare const PosthogContext: React.Context<posthog_js.PostHog | null>;
/**
 * Provider that initializes PostHog (posthog-js) and exposes it via context.
 * Use usePosthog() in children to get track, identify, reset, feature flags, etc.
 */
declare const PosthogProvider: React.FC<PosthogProviderProps>;

/**
 * Hook that returns the full PostHog API to match posthog_service.
 * Use track({ name, properties: { $screen_name, $current_url, ... } }), identify, reset,
 * register, feature flags, opt-in/out, etc. When used outside PosthogProvider or when
 * PostHog is not initialized, all methods are no-ops and isInitialized is false.
 */
declare function usePosthog(): Posthog;

/** Return type of usePosthogSessionReplay — same shape as React Native for cross-platform use. */
interface PosthogSessionReplayAPI {
    startRecording: () => void;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    isRecording: () => boolean;
    isInitialized: boolean;
}
/**
 * Hook for controlling PostHog session replay (web).
 * Use when enableSessionReplay is true or when you start recording manually via startRecording().
 * Pause/resume are no-ops on web (posthog-js does not support them).
 */
declare function usePosthogSessionReplay(): PosthogSessionReplayAPI;

/**
 * Renders nothing. On mount, starts PostHog session recording if the hook is initialized.
 * Render this inside PosthogProvider when enableSessionReplay is true (or when you want to start recording manually).
 */
declare function PosthogSessionReplayStarter(): null;

/**
 * PostHog host URLs
 */
declare const POSTHOG_HOSTS: {
    readonly US: "https://us.i.posthog.com";
    readonly EU: "https://eu.i.posthog.com";
};
declare const DEFAULT_HOST: "https://eu.i.posthog.com";

export { DEFAULT_HOST, POSTHOG_HOSTS, type Posthog, PosthogContext, PosthogProvider, type PosthogProviderProps, type PosthogSessionReplayAPI, PosthogSessionReplayStarter, type SessionReplayConfig, type TrackEvent, usePosthog, usePosthogSessionReplay };
