import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PosthogContext } from './PosthogProvider';
import { usePosthog } from './usePosthog';
import { createMockPosthogClient, type MockPosthogClient } from './test/mockPosthog';

function wrapperWithClient(client: MockPosthogClient | null) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PosthogContext.Provider value={client as never}>
        {children}
      </PosthogContext.Provider>
    );
  };
}

describe('usePosthog', () => {
  it('returns no-op API when outside provider / client is null', () => {
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(null),
    });
    expect(result.current.isInitialized).toBe(false);
    expect(() => {
      result.current.track({ name: 'x' });
      result.current.identify('id');
      result.current.setUserProperties({ a: 1 });
      result.current.setUserPropertiesOnce({ b: 2 });
      result.current.reset();
      result.current.register({ c: 3 });
      result.current.unregister('c');
      void result.current.flush();
      result.current.optIn();
      result.current.optOut();
      result.current.isOptedOut();
      result.current.isFeatureEnabled('flag');
      result.current.getFeatureFlag('flag');
      result.current.getFeatureFlagPayload('flag');
      result.current.reloadFeatureFlags();
      void result.current.reloadFeatureFlagsAsync();
      result.current.onFeatureFlags(() => {});
      result.current.setPersonPropertiesForFlags({ d: 4 });
      result.current.resetPersonPropertiesForFlags();
    }).not.toThrow();
  });

  it('track calls capture with name and properties', () => {
    const client = createMockPosthogClient();
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });
    expect(result.current.isInitialized).toBe(true);
    act(() => {
      result.current.track({ name: 'click', properties: { btn: 'a' } });
    });
    expect(client.capture).toHaveBeenCalledWith('click', { btn: 'a' });
  });

  it('track uses empty properties when omitted', () => {
    const client = createMockPosthogClient();
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });
    act(() => {
      result.current.track({ name: 'click' });
    });
    expect(client.capture).toHaveBeenCalledWith('click', {});
  });

  it('identify, setUserProperties, setUserPropertiesOnce, reset', () => {
    const client = createMockPosthogClient();
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });
    act(() => {
      result.current.identify('user-1', { email: 'a@b.com' });
      result.current.setUserProperties({ plan: 'pro' });
      result.current.setUserPropertiesOnce({ signup: '2024' });
      result.current.reset();
    });
    expect(client.identify).toHaveBeenCalledWith('user-1', { email: 'a@b.com' });
    expect(client.capture).toHaveBeenCalledWith('$set', { $set: { plan: 'pro' } });
    expect(client.capture).toHaveBeenCalledWith('$set_once', { $set_once: { signup: '2024' } });
    expect(client.reset).toHaveBeenCalled();
  });

  it('register and unregister', () => {
    const client = createMockPosthogClient();
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });
    act(() => {
      result.current.register({ campaign: 'summer' });
      result.current.register();
      result.current.unregister('campaign');
    });
    expect(client.register).toHaveBeenCalledWith({ campaign: 'summer' });
    expect(client.register).toHaveBeenCalledWith({});
    expect(client.unregister).toHaveBeenCalledWith('campaign');
  });

  it('flush calls client.flush', async () => {
    const client = createMockPosthogClient();
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });
    await act(async () => {
      await result.current.flush();
    });
    expect(client.flush).toHaveBeenCalled();
  });

  it('consent: optIn, optOut, isOptedOut', () => {
    const client = createMockPosthogClient();
    client.consent.isOptedOut.mockReturnValue(true);
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });
    act(() => {
      result.current.optIn();
      result.current.optOut();
    });
    expect(client.consent.optInOut).toHaveBeenCalledWith(true);
    expect(client.consent.optInOut).toHaveBeenCalledWith(false);
    expect(result.current.isOptedOut()).toBe(true);
  });

  it('feature flags helpers', async () => {
    const client = createMockPosthogClient();
    client.getFeatureFlag.mockImplementation((key: string) => {
      if (key === 'bool') return true;
      if (key === 'variant') return 'control';
      if (key === 'nullish') return null;
      return undefined;
    });
    client.getFeatureFlagPayload.mockReturnValue({ x: 1 });
    const unsubscribe = vi.fn();
    client.onFeatureFlags.mockReturnValue(unsubscribe);

    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });

    expect(result.current.isFeatureEnabled('bool')).toBe(true);
    expect(result.current.isFeatureEnabled('variant')).toBe(true);
    expect(result.current.isFeatureEnabled('nullish')).toBe(false);
    expect(result.current.isFeatureEnabled('missing')).toBe(false);
    expect(result.current.getFeatureFlag('variant')).toBe('control');
    expect(result.current.getFeatureFlagPayload('exp')).toEqual({ x: 1 });

    act(() => {
      result.current.reloadFeatureFlags();
    });
    expect(client.reloadFeatureFlags).toHaveBeenCalled();

    const flags = await act(async () => result.current.reloadFeatureFlagsAsync());
    expect(flags).toEqual([]);
    expect(client.reloadFeatureFlags).toHaveBeenCalledTimes(2);

    const cb = vi.fn();
    let off: () => void = () => {};
    act(() => {
      off = result.current.onFeatureFlags(cb);
    });
    const onFlagsCb = client.onFeatureFlags.mock.calls[0][0] as (
      keys: string[],
      variants: Record<string, string | boolean>
    ) => void;
    onFlagsCb(['a'], { a: true });
    expect(cb).toHaveBeenCalledWith({ a: true });
    off();
    expect(unsubscribe).toHaveBeenCalled();

    act(() => {
      result.current.setPersonPropertiesForFlags({ cohort: 'beta' });
      result.current.setPersonPropertiesForFlags({ cohort: 'beta' }, false);
      result.current.resetPersonPropertiesForFlags();
    });
    expect(client.setPersonPropertiesForFlags).toHaveBeenCalledWith({ cohort: 'beta' }, true);
    expect(client.setPersonPropertiesForFlags).toHaveBeenCalledWith({ cohort: 'beta' }, false);
    expect(client.resetPersonPropertiesForFlags).toHaveBeenCalled();
  });

  it('swallows errors from client methods', async () => {
    const err = new Error('boom');
    const client = createMockPosthogClient({
      capture: vi.fn(() => {
        throw err;
      }),
      identify: vi.fn(() => {
        throw err;
      }),
      reset: vi.fn(() => {
        throw err;
      }),
      register: vi.fn(() => {
        throw err;
      }),
      unregister: vi.fn(() => {
        throw err;
      }),
      flush: vi.fn(() => {
        throw err;
      }),
      getFeatureFlag: vi.fn(() => {
        throw err;
      }),
      getFeatureFlagPayload: vi.fn(() => {
        throw err;
      }),
      reloadFeatureFlags: vi.fn(() => {
        throw err;
      }),
      onFeatureFlags: vi.fn(() => {
        throw err;
      }),
      setPersonPropertiesForFlags: vi.fn(() => {
        throw err;
      }),
      resetPersonPropertiesForFlags: vi.fn(() => {
        throw err;
      }),
      consent: {
        optInOut: vi.fn(() => {
          throw err;
        }),
        isOptedOut: vi.fn(() => {
          throw err;
        }),
      },
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePosthog(), {
      wrapper: wrapperWithClient(client),
    });

    expect(() => {
      result.current.track({ name: 'x' });
      result.current.identify('id');
      result.current.setUserProperties({ a: 1 });
      result.current.setUserPropertiesOnce({ b: 2 });
      result.current.reset();
      result.current.register({ c: 3 });
      result.current.unregister('c');
      result.current.optIn();
      result.current.optOut();
      result.current.isOptedOut();
      result.current.isFeatureEnabled('f');
      result.current.getFeatureFlag('f');
      result.current.getFeatureFlagPayload('f');
      result.current.reloadFeatureFlags();
      result.current.onFeatureFlags(() => {});
      result.current.setPersonPropertiesForFlags({});
      result.current.resetPersonPropertiesForFlags();
    }).not.toThrow();

    await expect(result.current.flush()).resolves.toBeUndefined();
    await expect(result.current.reloadFeatureFlagsAsync()).resolves.toEqual([]);

    spy.mockRestore();
  });
});
