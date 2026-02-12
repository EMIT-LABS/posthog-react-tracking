import posthog from 'posthog-js';
import React, { createContext, useMemo } from 'react';
import { DEFAULT_HOST } from './constants';
import type { PosthogProviderProps } from './types';

export const PosthogContext = createContext<ReturnType<typeof posthog.init> | null>(null);

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
  options = {},
  children,
}) => {
  const client = useMemo(() => {
    if (!apiKey || apiKey === 'undefined') {
      return null;
    }
    const initOptions: Record<string, unknown> = {
      api_host: host ?? DEFAULT_HOST,
      person_profiles: 'identified_only',
      ...options,
    };
    if (debug !== undefined) initOptions.debug = debug;
    if (autocapture !== undefined) initOptions.autocapture = autocapture;
    if (disableGeoip !== undefined) initOptions.disable_geoip = disableGeoip;
    posthog.init(apiKey, initOptions as Parameters<typeof posthog.init>[1]);
    return posthog;
  }, [apiKey, host, debug, autocapture, disableGeoip, options]);

  return (
    <PosthogContext.Provider value={client}>
      {children}
    </PosthogContext.Provider>
  );
};
