import { renderHook, act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PosthogContext } from './PosthogProvider';
import { usePosthogSessionReplay } from './usePosthogSessionReplay';
import { PosthogSessionReplayStarter } from './PosthogSessionReplayStarter';
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

describe('usePosthogSessionReplay', () => {
  it('returns not-initialized API when client is null', () => {
    const { result } = renderHook(() => usePosthogSessionReplay(), {
      wrapper: wrapperWithClient(null),
    });
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isRecording()).toBe(false);
    expect(() => {
      result.current.startRecording();
      result.current.stopRecording();
      result.current.pauseRecording();
      result.current.resumeRecording();
    }).not.toThrow();
  });

  it('startRecording / stopRecording / isRecording call posthog-js methods', () => {
    const client = createMockPosthogClient();
    client.sessionRecordingStarted.mockReturnValue(true);
    const { result } = renderHook(() => usePosthogSessionReplay(), {
      wrapper: wrapperWithClient(client),
    });

    expect(result.current.isInitialized).toBe(true);
    act(() => {
      result.current.startRecording();
      result.current.stopRecording();
    });
    expect(client.startSessionRecording).toHaveBeenCalledWith(true);
    expect(client.stopSessionRecording).toHaveBeenCalled();
    expect(result.current.isRecording()).toBe(true);
  });

  it('pauseRecording and resumeRecording are no-ops', () => {
    const client = createMockPosthogClient();
    const { result } = renderHook(() => usePosthogSessionReplay(), {
      wrapper: wrapperWithClient(client),
    });
    act(() => {
      result.current.pauseRecording();
      result.current.resumeRecording();
    });
    expect(client.startSessionRecording).not.toHaveBeenCalled();
    expect(client.stopSessionRecording).not.toHaveBeenCalled();
  });

  it('swallows errors from session recording methods', () => {
    const err = new Error('replay fail');
    const client = createMockPosthogClient({
      startSessionRecording: vi.fn(() => {
        throw err;
      }),
      stopSessionRecording: vi.fn(() => {
        throw err;
      }),
      sessionRecordingStarted: vi.fn(() => {
        throw err;
      }),
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePosthogSessionReplay(), {
      wrapper: wrapperWithClient(client),
    });
    expect(() => {
      result.current.startRecording();
      result.current.stopRecording();
      result.current.isRecording();
    }).not.toThrow();
    expect(result.current.isRecording()).toBe(false);
    spy.mockRestore();
  });

  it('skips start/stop when methods are missing', () => {
    const client = createMockPosthogClient({
      startSessionRecording: undefined,
      stopSessionRecording: undefined,
      sessionRecordingStarted: undefined,
    });
    const { result } = renderHook(() => usePosthogSessionReplay(), {
      wrapper: wrapperWithClient(client),
    });
    act(() => {
      result.current.startRecording();
      result.current.stopRecording();
    });
    expect(result.current.isRecording()).toBe(false);
  });
});

describe('PosthogSessionReplayStarter', () => {
  it('starts recording on mount when initialized', () => {
    const client = createMockPosthogClient();
    render(
      <PosthogContext.Provider value={client as never}>
        <PosthogSessionReplayStarter />
      </PosthogContext.Provider>
    );
    expect(client.startSessionRecording).toHaveBeenCalledWith(true);
  });

  it('does not start recording when client is null', () => {
    const client = createMockPosthogClient();
    render(
      <PosthogContext.Provider value={null}>
        <PosthogSessionReplayStarter />
      </PosthogContext.Provider>
    );
    expect(client.startSessionRecording).not.toHaveBeenCalled();
  });
});
