"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_HOST: () => DEFAULT_HOST,
  POSTHOG_HOSTS: () => POSTHOG_HOSTS,
  PosthogContext: () => PosthogContext,
  PosthogProvider: () => PosthogProvider,
  PosthogSessionReplayStarter: () => PosthogSessionReplayStarter,
  usePosthog: () => usePosthog,
  usePosthogSessionReplay: () => usePosthogSessionReplay
});
module.exports = __toCommonJS(index_exports);

// src/PosthogProvider.tsx
var import_posthog_js = __toESM(require("posthog-js"));
var import_react = require("react");

// src/constants.ts
var POSTHOG_HOSTS = {
  US: "https://us.i.posthog.com",
  EU: "https://eu.i.posthog.com"
};
var DEFAULT_HOST = POSTHOG_HOSTS.EU;

// src/PosthogProvider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var PosthogContext = (0, import_react.createContext)(null);
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
  const client = (0, import_react.useMemo)(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (!apiKey || apiKey === "undefined") {
      return null;
    }
    if (typeof import_posthog_js.default.init !== "function") {
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
    import_posthog_js.default.init(apiKey, initOptions);
    return import_posthog_js.default;
  }, [apiKey, host, debug, autocapture, disableGeoip, enableSessionReplay, sessionReplayConfig, options]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosthogContext.Provider, { value: client, children });
};

// src/usePosthog.ts
var import_react2 = require("react");
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
  const client = (0, import_react2.useContext)(PosthogContext);
  const track = (0, import_react2.useCallback)(
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
  const identify = (0, import_react2.useCallback)(
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
  const setUserProperties = (0, import_react2.useCallback)(
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
  const setUserPropertiesOnce = (0, import_react2.useCallback)(
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
  const reset = (0, import_react2.useCallback)(() => {
    if (!client) return;
    try {
      client.reset();
    } catch (e) {
      console.error("[posthog-react-tracking] reset error:", e);
    }
  }, [client]);
  const register = (0, import_react2.useCallback)(
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
  const unregister = (0, import_react2.useCallback)(
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
  const flush = (0, import_react2.useCallback)(async () => {
    if (!client) return;
    try {
      await client.flush?.();
    } catch (e) {
      console.error("[posthog-react-tracking] flush error:", e);
    }
  }, [client]);
  const optIn = (0, import_react2.useCallback)(() => {
    if (!client) return;
    try {
      client.consent?.optInOut(true);
    } catch (e) {
      console.error("[posthog-react-tracking] optIn error:", e);
    }
  }, [client]);
  const optOut = (0, import_react2.useCallback)(() => {
    if (!client) return;
    try {
      client.consent?.optInOut(false);
    } catch (e) {
      console.error("[posthog-react-tracking] optOut error:", e);
    }
  }, [client]);
  const isOptedOut = (0, import_react2.useCallback)(() => {
    if (!client) return false;
    try {
      return client.consent?.isOptedOut() ?? false;
    } catch (e) {
      console.error("[posthog-react-tracking] isOptedOut error:", e);
      return false;
    }
  }, [client]);
  const isFeatureEnabled = (0, import_react2.useCallback)(
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
  const getFeatureFlag = (0, import_react2.useCallback)(
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
  const getFeatureFlagPayload = (0, import_react2.useCallback)(
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
  const reloadFeatureFlags = (0, import_react2.useCallback)(() => {
    if (!client) return;
    try {
      client.reloadFeatureFlags();
    } catch (e) {
      console.error("[posthog-react-tracking] reloadFeatureFlags error:", e);
    }
  }, [client]);
  const reloadFeatureFlagsAsync = (0, import_react2.useCallback)(async () => {
    if (!client) return [];
    try {
      client.reloadFeatureFlags();
      return [];
    } catch (e) {
      console.error("[posthog-react-tracking] reloadFeatureFlagsAsync error:", e);
      return [];
    }
  }, [client]);
  const onFeatureFlags = (0, import_react2.useCallback)(
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
  const setPersonPropertiesForFlags = (0, import_react2.useCallback)(
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
  const resetPersonPropertiesForFlags = (0, import_react2.useCallback)(() => {
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
var import_react3 = require("react");
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
  const client = (0, import_react3.useContext)(PosthogContext);
  const startRecording = (0, import_react3.useCallback)(() => {
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
  const stopRecording = (0, import_react3.useCallback)(() => {
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
  const pauseRecording = (0, import_react3.useCallback)(() => {
  }, []);
  const resumeRecording = (0, import_react3.useCallback)(() => {
  }, []);
  const isRecording = (0, import_react3.useCallback)(() => {
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
var import_react4 = require("react");
function PosthogSessionReplayStarter() {
  const { startRecording, isInitialized } = usePosthogSessionReplay();
  (0, import_react4.useEffect)(() => {
    if (isInitialized) {
      startRecording();
    }
  }, [isInitialized, startRecording]);
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_HOST,
  POSTHOG_HOSTS,
  PosthogContext,
  PosthogProvider,
  PosthogSessionReplayStarter,
  usePosthog,
  usePosthogSessionReplay
});
//# sourceMappingURL=index.js.map