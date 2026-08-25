import { vi } from 'vitest';

/** Shared mock PostHog client used across unit tests. */
export function createMockPosthogClient(overrides: Record<string, unknown> = {}) {
  return {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    register: vi.fn(),
    unregister: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    getFeatureFlag: vi.fn(),
    getFeatureFlagPayload: vi.fn(),
    reloadFeatureFlags: vi.fn(),
    onFeatureFlags: vi.fn().mockReturnValue(() => {}),
    setPersonPropertiesForFlags: vi.fn(),
    resetPersonPropertiesForFlags: vi.fn(),
    startSessionRecording: vi.fn(),
    stopSessionRecording: vi.fn(),
    sessionRecordingStarted: vi.fn().mockReturnValue(false),
    consent: {
      optInOut: vi.fn(),
      isOptedOut: vi.fn().mockReturnValue(false),
    },
    ...overrides,
  };
}

export type MockPosthogClient = ReturnType<typeof createMockPosthogClient>;
