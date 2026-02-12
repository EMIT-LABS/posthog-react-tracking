import posthog from 'posthog-js';
import React, { createContext, useMemo } from 'react';
import { DEFAULT_HOST } from './constants';
import type { PosthogProviderProps, SessionReplayConfig } from './types';

export const PosthogContext = createContext<ReturnType<typeof posthog.init> | null>(null);

function buildSessionRecordingConfig(config: SessionReplayConfig | undefined): Record<string, unknown> | undefined {
  if (!config) return undefined;
  const masking: Record<string, unknown> = {};
  if (config.maskAllInputs !== undefined) masking.maskAllInputs = config.maskAllInputs;
  if (config.maskTextSelector !== undefined && config.maskTextSelector !== null) masking.maskTextSelector = config.maskTextSelector;
  if (config.blockSelector !== undefined && config.blockSelector !== null) masking.blockSelector = config.blockSelector;
  if (Object.keys(masking).length === 0) return undefined;
  return { masking };
}

/**
 * Provider that initializes PostHog (posthog-js) and exposes it via context.
 * Use usePosthog() in children to get track, identify, reset, feature flags, etc.
 */
export const PosthogProvider: React.FC<PosthogProviderProps> = ({
  apiKey,
  host,
  debug,
  autocapture,
  disableGeoip,
  enableSessionReplay,
  sessionReplayConfig,
  options = {},
  children,
}) => {
  const client = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!apiKey || apiKey === 'undefined') {
      return null;
    }
    if (typeof posthog.init !== 'function') {
      return null;
    }
    const initOptions: Record<string, unknown> = {
      api_host: host ?? DEFAULT_HOST,
      person_profiles: 'identified_only',
      disable_session_recording: enableSessionReplay === false,
      ...options,
    };
    if (debug !== undefined) initOptions.debug = debug;
    if (autocapture !== undefined) initOptions.autocapture = autocapture;
    if (disableGeoip !== undefined) initOptions.disable_geoip = disableGeoip;
    const sessionRecording = buildSessionRecordingConfig(sessionReplayConfig);
    if (sessionRecording) initOptions.sessionRecording = sessionRecording;
    posthog.init(apiKey, initOptions as Parameters<typeof posthog.init>[1]);
    return posthog;
  }, [apiKey, host, debug, autocapture, disableGeoip, enableSessionReplay, sessionReplayConfig, options]);

  return (
    <PosthogContext.Provider value={client}>
      {children}
    </PosthogContext.Provider>
  );
};
