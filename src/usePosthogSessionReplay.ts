import { useCallback, useContext } from 'react';
import { PosthogContext } from './PosthogProvider';

/** Return type of usePosthogSessionReplay — same shape as React Native for cross-platform use. */
export interface PosthogSessionReplayAPI {
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  isRecording: () => boolean;
  isInitialized: boolean;
}

const NOT_INITIALIZED: PosthogSessionReplayAPI = {
  startRecording: () => {},
  stopRecording: () => {},
  pauseRecording: () => {},
  resumeRecording: () => {},
  isRecording: () => false,
  isInitialized: false,
};

/** Minimal type for posthog-js client with session recording methods. */
interface PosthogClientWithReplay {
  startSessionRecording?: (override?: unknown) => void;
  stopSessionRecording?: () => void;
  sessionRecordingStarted?: () => boolean;
}

/**
 * Hook for controlling PostHog session replay (web).
 * Use when enableSessionReplay is true or when you start recording manually via startRecording().
 * Pause/resume are no-ops on web (posthog-js does not support them).
 */
export function usePosthogSessionReplay(): PosthogSessionReplayAPI {
  const client = useContext(PosthogContext);

  const startRecording = useCallback(() => {
    if (!client) return;
    try {
      const c = client as PosthogClientWithReplay;
      if (typeof c.startSessionRecording === 'function') {
        c.startSessionRecording(true);
      }
    } catch (e) {
      console.error('[posthog-react-tracking] startSessionRecording error:', e);
    }
  }, [client]);

  const stopRecording = useCallback(() => {
    if (!client) return;
    try {
      const c = client as PosthogClientWithReplay;
      if (typeof c.stopSessionRecording === 'function') {
        c.stopSessionRecording();
      }
    } catch (e) {
      console.error('[posthog-react-tracking] stopSessionRecording error:', e);
    }
  }, [client]);

  const pauseRecording = useCallback(() => {
    // posthog-js does not expose pause; no-op for API parity with React Native
  }, []);

  const resumeRecording = useCallback(() => {
    // posthog-js does not expose resume; no-op for API parity with React Native
  }, []);

  const isRecording = useCallback((): boolean => {
    if (!client) return false;
    try {
      const c = client as PosthogClientWithReplay;
      if (typeof c.sessionRecordingStarted === 'function') {
        return c.sessionRecordingStarted();
      }
    } catch (e) {
      console.error('[posthog-react-tracking] sessionRecordingStarted error:', e);
    }
    return false;
  }, [client]);

  if (!client) {
    return NOT_INITIALIZED;
  }

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isInitialized: true,
  };
}
