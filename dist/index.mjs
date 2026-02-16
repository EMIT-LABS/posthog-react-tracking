// src/PosthogProvider.tsx
import posthog from "posthog-js";
import { createContext, useMemo } from "react";

// src/constants.ts
var POSTHOG_HOSTS = {
  US: "https://us.i.posthog.com",
  EU: "https://eu.i.posthog.com"
};
var DEFAULT_HOST = POSTHOG_HOSTS.EU;

// src/PosthogProvider.tsx
import { jsx } from "react/jsx-runtime";
var PosthogContext = createContext(null);
function buildSessionRecordingConfig(config) {
  if (!config) return void 0;
  const masking = {};
  if (config.maskAllInputs !== void 0) masking.maskAllInputs = config.maskAllInputs;
  if (config.maskTextSelector !== void 0 && config.maskTextSelector !== null) masking.maskTextSelector = config.maskTextSelector;
  if (config.blockSelector !== void 0 && config.blockSelector !== null) masking.blockSelector = config.blockSelector;
  if (Object.keys(masking).length === 0) return void 0;
  return { masking };
}
var PosthogProvider = ({
  apiKey,
  host,
  debug,
  autocapture,
  disableGeoip,
  enableSessionReplay,
  sessionReplayConfig,
  options = {},
  children
}) => {
  const client = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (!apiKey || apiKey === "undefined") {
      return null;
    }
    if (typeof posthog.init !== "function") {
      return null;
    }
    const initOptions = {
      api_host: host ?? DEFAULT_HOST,
      person_profiles: "identified_only",
      disable_session_recording: enableSessionReplay === false,
      ...options
    };
    if (debug !== void 0) initOptions.debug = debug;
    if (autocapture !== void 0) initOptions.autocapture = autocapture;
    if (disableGeoip !== void 0) initOptions.disable_geoip = disableGeoip;
    const sessionRecording = buildSessionRecordingConfig(sessionReplayConfig);
    if (sessionRecording) initOptions.sessionRecording = sessionRecording;
    posthog.init(apiKey, initOptions);
    return posthog;
  }, [apiKey, host, debug, autocapture, disableGeoip, enableSessionReplay, sessionReplayConfig, options]);
  return /* @__PURE__ */ jsx(PosthogContext.Provider, { value: client, children });
};

// src/usePosthog.ts
import { useCallback, useContext } from "react";
var noop = () => {
};
var noopAsync = async () => {
};
var NOT_INITIALIZED = {
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
  isFeatureEnabled: () => void 0,
  getFeatureFlag: () => void 0,
  getFeatureFlagPayload: () => void 0,
  reloadFeatureFlags: noop,
  reloadFeatureFlagsAsync: async () => [],
  onFeatureFlags: () => () => {
  },
  setPersonPropertiesForFlags: noop,
  resetPersonPropertiesForFlags: noop,
  isInitialized: false
};
function usePosthog() {
  const client = useContext(PosthogContext);
  const track = useCallback(
    (event) => {
      if (!client) return;
      try {
        client.capture(event.name, event.properties ?? {});
      } catch (e) {
        console.error("[posthog-react-tracking] track error:", e);
      }
    },
    [client]
  );
  const identify = useCallback(
    (distinctId, properties) => {
      if (!client) return;
      try {
        client.identify(distinctId, properties);
      } catch (e) {
        console.error("[posthog-react-tracking] identify error:", e);
      }
    },
    [client]
  );
  const setUserProperties = useCallback(
    (properties) => {
      if (!client) return;
      try {
        client.capture("$set", { $set: properties });
      } catch (e) {
        console.error("[posthog-react-tracking] setUserProperties error:", e);
      }
    },
    [client]
  );
  const setUserPropertiesOnce = useCallback(
    (properties) => {
      if (!client) return;
      try {
        client.capture("$set_once", { $set_once: properties });
      } catch (e) {
        console.error("[posthog-react-tracking] setUserPropertiesOnce error:", e);
      }
    },
    [client]
  );
  const reset = useCallback(() => {
    if (!client) return;
    try {
      client.reset();
    } catch (e) {
      console.error("[posthog-react-tracking] reset error:", e);
    }
  }, [client]);
  const register = useCallback(
    (properties) => {
      if (!client) return;
      try {
        client.register(properties ?? {});
      } catch (e) {
        console.error("[posthog-react-tracking] register error:", e);
      }
    },
    [client]
  );
  const unregister = useCallback(
    (property) => {
      if (!client) return;
      try {
        client.unregister(property);
      } catch (e) {
        console.error("[posthog-react-tracking] unregister error:", e);
      }
    },
    [client]
  );
  const flush = useCallback(async () => {
    if (!client) return;
    try {
      await client.flush?.();
    } catch (e) {
      console.error("[posthog-react-tracking] flush error:", e);
    }
  }, [client]);
  const optIn = useCallback(() => {
    if (!client) return;
    try {
      client.consent?.optInOut(true);
    } catch (e) {
      console.error("[posthog-react-tracking] optIn error:", e);
    }
  }, [client]);
  const optOut = useCallback(() => {
    if (!client) return;
    try {
      client.consent?.optInOut(false);
    } catch (e) {
      console.error("[posthog-react-tracking] optOut error:", e);
    }
  }, [client]);
  const isOptedOut = useCallback(() => {
    if (!client) return false;
    try {
      return client.consent?.isOptedOut() ?? false;
    } catch (e) {
      console.error("[posthog-react-tracking] isOptedOut error:", e);
      return false;
    }
  }, [client]);
  const isFeatureEnabled = useCallback(
    (flagKey) => {
      if (!client) return void 0;
      try {
        const v = client.getFeatureFlag(flagKey);
        if (typeof v === "boolean") return v;
        if (v !== void 0 && v !== null) return true;
        return false;
      } catch (e) {
        console.error("[posthog-react-tracking] isFeatureEnabled error:", e);
        return void 0;
      }
    },
    [client]
  );
  const getFeatureFlag = useCallback(
    (flagKey) => {
      if (!client) return void 0;
      try {
        return client.getFeatureFlag(flagKey);
      } catch (e) {
        console.error("[posthog-react-tracking] getFeatureFlag error:", e);
        return void 0;
      }
    },
    [client]
  );
  const getFeatureFlagPayload = useCallback(
    (flagKey) => {
      if (!client) return void 0;
      try {
        return client.getFeatureFlagPayload(flagKey);
      } catch (e) {
        console.error("[posthog-react-tracking] getFeatureFlagPayload error:", e);
        return void 0;
      }
    },
    [client]
  );
  const reloadFeatureFlags = useCallback(() => {
    if (!client) return;
    try {
      client.reloadFeatureFlags();
    } catch (e) {
      console.error("[posthog-react-tracking] reloadFeatureFlags error:", e);
    }
  }, [client]);
  const reloadFeatureFlagsAsync = useCallback(async () => {
    if (!client) return [];
    try {
      client.reloadFeatureFlags();
      return [];
    } catch (e) {
      console.error("[posthog-react-tracking] reloadFeatureFlagsAsync error:", e);
      return [];
    }
  }, [client]);
  const onFeatureFlags = useCallback(
    (callback) => {
      if (!client) return () => {
      };
      try {
        return client.onFeatureFlags((_keys, variants) => {
          callback(variants ?? {});
        });
      } catch (e) {
        console.error("[posthog-react-tracking] onFeatureFlags error:", e);
        return () => {
        };
      }
    },
    [client]
  );
  const setPersonPropertiesForFlags = useCallback(
    (properties, reloadFlags = true) => {
      if (!client) return;
      try {
        client.setPersonPropertiesForFlags(properties, reloadFlags);
      } catch (e) {
        console.error("[posthog-react-tracking] setPersonPropertiesForFlags error:", e);
      }
    },
    [client]
  );
  const resetPersonPropertiesForFlags = useCallback(() => {
    if (!client) return;
    try {
      client.resetPersonPropertiesForFlags();
    } catch (e) {
      console.error("[posthog-react-tracking] resetPersonPropertiesForFlags error:", e);
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
    isInitialized: true
  };
}

// src/usePosthogSessionReplay.ts
import { useCallback as useCallback2, useContext as useContext2 } from "react";
var NOT_INITIALIZED2 = {
  startRecording: () => {
  },
  stopRecording: () => {
  },
  pauseRecording: () => {
  },
  resumeRecording: () => {
  },
  isRecording: () => false,
  isInitialized: false
};
function usePosthogSessionReplay() {
  const client = useContext2(PosthogContext);
  const startRecording = useCallback2(() => {
    if (!client) return;
    try {
      const c = client;
      if (typeof c.startSessionRecording === "function") {
        c.startSessionRecording(true);
      }
    } catch (e) {
      console.error("[posthog-react-tracking] startSessionRecording error:", e);
    }
  }, [client]);
  const stopRecording = useCallback2(() => {
    if (!client) return;
    try {
      const c = client;
      if (typeof c.stopSessionRecording === "function") {
        c.stopSessionRecording();
      }
    } catch (e) {
      console.error("[posthog-react-tracking] stopSessionRecording error:", e);
    }
  }, [client]);
  const pauseRecording = useCallback2(() => {
  }, []);
  const resumeRecording = useCallback2(() => {
  }, []);
  const isRecording = useCallback2(() => {
    if (!client) return false;
    try {
      const c = client;
      if (typeof c.sessionRecordingStarted === "function") {
        return c.sessionRecordingStarted();
      }
    } catch (e) {
      console.error("[posthog-react-tracking] sessionRecordingStarted error:", e);
    }
    return false;
  }, [client]);
  if (!client) {
    return NOT_INITIALIZED2;
  }
  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isInitialized: true
  };
}

// src/PosthogSessionReplayStarter.tsx
import { useEffect } from "react";
function PosthogSessionReplayStarter() {
  const { startRecording, isInitialized } = usePosthogSessionReplay();
  useEffect(() => {
    if (isInitialized) {
      startRecording();
    }
  }, [isInitialized, startRecording]);
  return null;
}
export {
  DEFAULT_HOST,
  POSTHOG_HOSTS,
  PosthogContext,
  PosthogProvider,
  PosthogSessionReplayStarter,
  usePosthog,
  usePosthogSessionReplay
};
//# sourceMappingURL=index.mjs.map