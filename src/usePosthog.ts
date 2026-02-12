import { useCallback, useContext } from 'react';
import { PosthogContext } from './PosthogProvider';
import type { Posthog, TrackEvent } from './types';

const noop = () => {};
const noopAsync = async () => {};

/** No-op return value when PostHog is not initialized (matches posthog_service API) */
const NOT_INITIALIZED: Posthog = {
  track: noop,
  identify: noop,
  setUserProperties: noop,
  setUserPropertiesOnce: noop,
  reset: noop,
  register: noop,
  unregister: noop,
  flush: noopAsync,
  optIn: noop,
  optOut: noop,
  isOptedOut: () => false,
  isFeatureEnabled: () => undefined,
  getFeatureFlag: () => undefined,
  getFeatureFlagPayload: () => undefined,
  reloadFeatureFlags: noop,
  reloadFeatureFlagsAsync: async () => [],
  onFeatureFlags: () => () => {},
  setPersonPropertiesForFlags: noop,
  resetPersonPropertiesForFlags: noop,
  isInitialized: false,
};

/**
 * Hook that returns the full PostHog API to match posthog_service.
 * Use track({ name, properties: { $screen_name, $current_url, ... } }), identify, reset,
 * register, feature flags, opt-in/out, etc. When used outside PosthogProvider or when
 * PostHog is not initialized, all methods are no-ops and isInitialized is false.
 */
export function usePosthog(): Posthog {
  const client = useContext(PosthogContext);

  const track = useCallback(
    (event: TrackEvent) => {
      if (!client) return;
      try {
        client.capture(event.name, event.properties ?? {});
      } catch (e) {
        console.error('[posthog-react-tracking] track error:', e);
      }
    },
    [client]
  );

  const identify = useCallback(
    (distinctId: string, properties?: Record<string, unknown>) => {
      if (!client) return;
      try {
        client.identify(distinctId, properties);
      } catch (e) {
        console.error('[posthog-react-tracking] identify error:', e);
      }
    },
    [client]
  );

  const setUserProperties = useCallback(
    (properties: Record<string, unknown>) => {
      if (!client) return;
      try {
        client.capture('$set', { $set: properties });
      } catch (e) {
        console.error('[posthog-react-tracking] setUserProperties error:', e);
      }
    },
    [client]
  );

  const setUserPropertiesOnce = useCallback(
    (properties: Record<string, unknown>) => {
      if (!client) return;
      try {
        client.capture('$set_once', { $set_once: properties });
      } catch (e) {
        console.error('[posthog-react-tracking] setUserPropertiesOnce error:', e);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    if (!client) return;
    try {
      client.reset();
    } catch (e) {
      console.error('[posthog-react-tracking] reset error:', e);
    }
  }, [client]);

  const register = useCallback(
    (properties?: Record<string, unknown>) => {
      if (!client) return;
      try {
        client.register(properties ?? {});
      } catch (e) {
        console.error('[posthog-react-tracking] register error:', e);
      }
    },
    [client]
  );

  const unregister = useCallback(
    (property: string) => {
      if (!client) return;
      try {
        client.unregister(property);
      } catch (e) {
        console.error('[posthog-react-tracking] unregister error:', e);
      }
    },
    [client]
  );

  const flush = useCallback(async () => {
    if (!client) return;
    try {
      await (client as { flush?: () => Promise<void> }).flush?.();
    } catch (e) {
      console.error('[posthog-react-tracking] flush error:', e);
    }
  }, [client]);

  const optIn = useCallback(() => {
    if (!client) return;
    try {
      (client as { consent?: { optInOut: (v: boolean) => void } }).consent?.optInOut(true);
    } catch (e) {
      console.error('[posthog-react-tracking] optIn error:', e);
    }
  }, [client]);

  const optOut = useCallback(() => {
    if (!client) return;
    try {
      (client as { consent?: { optInOut: (v: boolean) => void } }).consent?.optInOut(false);
    } catch (e) {
      console.error('[posthog-react-tracking] optOut error:', e);
    }
  }, [client]);

  const isOptedOut = useCallback((): boolean => {
    if (!client) return false;
    try {
      return (client as { consent?: { isOptedOut: () => boolean } }).consent?.isOptedOut() ?? false;
    } catch (e) {
      console.error('[posthog-react-tracking] isOptedOut error:', e);
      return false;
    }
  }, [client]);

  const isFeatureEnabled = useCallback(
    (flagKey: string): boolean | undefined => {
      if (!client) return undefined;
      try {
        const v = client.getFeatureFlag(flagKey);
        if (typeof v === 'boolean') return v;
        if (v !== undefined && v !== null) return true;
        return false;
      } catch (e) {
        console.error('[posthog-react-tracking] isFeatureEnabled error:', e);
        return undefined;
      }
    },
    [client]
  );

  const getFeatureFlag = useCallback(
    (flagKey: string): string | boolean | undefined => {
      if (!client) return undefined;
      try {
        return client.getFeatureFlag(flagKey) as string | boolean | undefined;
      } catch (e) {
        console.error('[posthog-react-tracking] getFeatureFlag error:', e);
        return undefined;
      }
    },
    [client]
  );

  const getFeatureFlagPayload = useCallback(
    (flagKey: string): unknown => {
      if (!client) return undefined;
      try {
        return client.getFeatureFlagPayload(flagKey);
      } catch (e) {
        console.error('[posthog-react-tracking] getFeatureFlagPayload error:', e);
        return undefined;
      }
    },
    [client]
  );

  const reloadFeatureFlags = useCallback(() => {
    if (!client) return;
    try {
      client.reloadFeatureFlags();
    } catch (e) {
      console.error('[posthog-react-tracking] reloadFeatureFlags error:', e);
    }
  }, [client]);

  const reloadFeatureFlagsAsync = useCallback(async (): Promise<string[]> => {
    if (!client) return [];
    try {
      client.reloadFeatureFlags();
      return [];
    } catch (e) {
      console.error('[posthog-react-tracking] reloadFeatureFlagsAsync error:', e);
      return [];
    }
  }, [client]);

  const onFeatureFlags = useCallback(
    (callback: (flags: Record<string, string | boolean>) => void): (() => void) => {
      if (!client) return () => {};
      try {
        return client.onFeatureFlags((_keys, variants) => {
          callback((variants ?? {}) as Record<string, string | boolean>);
        });
      } catch (e) {
        console.error('[posthog-react-tracking] onFeatureFlags error:', e);
        return () => {};
      }
    },
    [client]
  );

  const setPersonPropertiesForFlags = useCallback(
    (properties: Record<string, unknown>, reloadFlags = true) => {
      if (!client) return;
      try {
        client.setPersonPropertiesForFlags(properties as Record<string, unknown>, reloadFlags);
      } catch (e) {
        console.error('[posthog-react-tracking] setPersonPropertiesForFlags error:', e);
      }
    },
    [client]
  );

  const resetPersonPropertiesForFlags = useCallback(() => {
    if (!client) return;
    try {
      client.resetPersonPropertiesForFlags();
    } catch (e) {
      console.error('[posthog-react-tracking] resetPersonPropertiesForFlags error:', e);
    }
  }, [client]);

  if (!client) {
    return NOT_INITIALIZED;
  }

  return {
    track,
    identify,
    setUserProperties,
    setUserPropertiesOnce,
    reset,
    register,
    unregister,
    flush,
    optIn,
    optOut,
    isOptedOut,
    isFeatureEnabled,
    getFeatureFlag,
    getFeatureFlagPayload,
    reloadFeatureFlags,
    reloadFeatureFlagsAsync,
    onFeatureFlags,
    setPersonPropertiesForFlags,
    resetPersonPropertiesForFlags,
    isInitialized: true,
  };
}
