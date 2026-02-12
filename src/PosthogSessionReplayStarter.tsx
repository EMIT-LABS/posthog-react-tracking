import { useEffect } from 'react';
import { usePosthogSessionReplay } from './usePosthogSessionReplay';

/**
 * Renders nothing. On mount, starts PostHog session recording if the hook is initialized.
 * Render this inside PosthogProvider when enableSessionReplay is true (or when you want to start recording manually).
 */
export function PosthogSessionReplayStarter(): null {
  const { startRecording, isInitialized } = usePosthogSessionReplay();

  useEffect(() => {
    if (isInitialized) {
      startRecording();
    }
  }, [isInitialized, startRecording]);

  return null;
}
