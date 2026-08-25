import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_HOST } from './constants';
import { PosthogContext, PosthogProvider } from './PosthogProvider';
import { useContext } from 'react';

const mockInit = vi.fn();

vi.mock('posthog-js', () => ({
  default: {
    init: (...args: unknown[]) => {
      mockInit(...args);
      return mockInit.mock.results[mockInit.mock.results.length - 1]?.value ?? {};
    },
  },
}));

function ContextProbe({ onValue }: { onValue: (v: unknown) => void }) {
  const value = useContext(PosthogContext);
  onValue(value);
  return null;
}

describe('PosthogProvider', () => {
  beforeEach(() => {
    mockInit.mockReset();
    mockInit.mockImplementation(() => ({ __client: true }));
  });

  it('does not init when apiKey is empty', () => {
    const onValue = vi.fn();
    render(
      <PosthogProvider apiKey="">
        <ContextProbe onValue={onValue} />
      </PosthogProvider>
    );
    expect(mockInit).not.toHaveBeenCalled();
    expect(onValue).toHaveBeenCalledWith(null);
  });

  it('does not init when apiKey is the string "undefined"', () => {
    const onValue = vi.fn();
    render(
      <PosthogProvider apiKey="undefined">
        <ContextProbe onValue={onValue} />
      </PosthogProvider>
    );
    expect(mockInit).not.toHaveBeenCalled();
    expect(onValue).toHaveBeenCalledWith(null);
  });

  it('initializes posthog with default host and options', () => {
    const onValue = vi.fn();
    render(
      <PosthogProvider apiKey="phc_test">
        <ContextProbe onValue={onValue} />
      </PosthogProvider>
    );
    expect(mockInit).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: DEFAULT_HOST,
        person_profiles: 'identified_only',
        disable_session_recording: false,
      })
    );
    expect(onValue).toHaveBeenCalled();
    expect(onValue.mock.calls[0][0]).not.toBeNull();
  });

  it('passes host, debug, autocapture, disableGeoip, and enableSessionReplay=false', () => {
    render(
      <PosthogProvider
        apiKey="phc_test"
        host="https://us.i.posthog.com"
        debug={true}
        autocapture={false}
        disableGeoip={true}
        enableSessionReplay={false}
      >
        <div />
      </PosthogProvider>
    );
    expect(mockInit).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: 'https://us.i.posthog.com',
        debug: true,
        autocapture: false,
        disable_geoip: true,
        disable_session_recording: true,
      })
    );
  });

  it('builds sessionRecording masking from sessionReplayConfig', () => {
    render(
      <PosthogProvider
        apiKey="phc_test"
        enableSessionReplay={true}
        sessionReplayConfig={{
          maskAllInputs: true,
          maskTextSelector: '.secret',
          blockSelector: 'img',
        }}
      >
        <div />
      </PosthogProvider>
    );
    expect(mockInit).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        disable_session_recording: false,
        sessionRecording: {
          masking: {
            maskAllInputs: true,
            maskTextSelector: '.secret',
            blockSelector: 'img',
          },
        },
      })
    );
  });

  it('omits sessionRecording when sessionReplayConfig is empty', () => {
    render(
      <PosthogProvider apiKey="phc_test" sessionReplayConfig={{}}>
        <div />
      </PosthogProvider>
    );
    const options = mockInit.mock.calls[0][1] as Record<string, unknown>;
    expect(options.sessionRecording).toBeUndefined();
  });

  it('ignores null maskTextSelector and blockSelector', () => {
    render(
      <PosthogProvider
        apiKey="phc_test"
        sessionReplayConfig={{
          maskAllInputs: false,
          maskTextSelector: null,
          blockSelector: null,
        }}
      >
        <div />
      </PosthogProvider>
    );
    expect(mockInit).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        sessionRecording: {
          masking: {
            maskAllInputs: false,
          },
        },
      })
    );
  });

  it('merges extra options into init', () => {
    render(
      <PosthogProvider apiKey="phc_test" options={{ persistence: 'localStorage' }}>
        <div />
      </PosthogProvider>
    );
    expect(mockInit).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        persistence: 'localStorage',
      })
    );
  });

  it('returns null client when posthog.init is not a function', async () => {
    const posthog = await import('posthog-js');
    const originalInit = (posthog.default as { init: unknown }).init;
    (posthog.default as { init: unknown }).init = undefined;

    const onValue = vi.fn();
    render(
      <PosthogProvider apiKey="phc_test">
        <ContextProbe onValue={onValue} />
      </PosthogProvider>
    );
    expect(onValue).toHaveBeenCalledWith(null);

    (posthog.default as { init: unknown }).init = originalInit;
  });
});
