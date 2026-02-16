# @Emit-Labs/posthog-react-tracking

React (web) PostHog tracking library.

It provides:

- `PosthogProvider` – initializes `posthog-js` once and exposes it via React context
- `usePosthog` – a hook exposing a **comprehensive PostHog API** (`track`, `identify`, super-properties, feature flags, consent, etc.)

Under the hood it uses [`posthog-js`](https://posthog.com/docs/libraries/js).

---

## 1. Installation

Install from GitHub. **Use the HTTPS URL in CI/deployment** (e.g. Vercel, Netlify, Docker); those environments usually don’t have `ssh`, so `git+ssh://` will fail with “ssh: not found”.

```bash
# HTTPS (works in CI/deploy and locally; use this in package.json for deploys)
yarn add git+https://github.com/EMIT-LABS/posthog-react-tracking.git#main
# or
npm install git+https://github.com/EMIT-LABS/posthog-react-tracking.git#main

# SSH (local dev only, if you use SSH keys)
yarn add git+ssh://git@github.com:EMIT-LABS/posthog-react-tracking.git#main
# or
npm install git+ssh://git@github.com:EMIT-LABS/posthog-react-tracking.git#main
```

**If your lockfile keeps showing `resolved: "git+ssh://..."`** even though `package.json` has `git+https://...`, that happens when Git is configured to rewrite HTTPS to SSH (e.g. `url.https://github.com/.insteadOf`). npm then stores the URL Git actually used. To avoid SSH entirely in the lockfile and in CI, use the **tarball URL** in your app's `package.json`:

```json
"@Emit-Labs/posthog-react-tracking": "https://github.com/EMIT-LABS/posthog-react-tracking/archive/refs/heads/main.tar.gz"
```

Then run `npm install` (or `yarn`) and commit the updated lockfile. The lockfile will resolve to that HTTPS tarball, so CI and deployment work without SSH.

### Peer dependency

In your **app**, make sure you also have `react` installed:

```bash
yarn add react
# or
npm install react
```

### Vite: "Cannot read properties of null (reading 'useContext')"

If you see this error (often in React Router’s `Meta` or similar), the app is loading more than one copy of React (e.g. from the library’s `node_modules`). Force a single React instance in your app:

**vite.config.ts** (or **vite.config.js**):

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // ... rest of config
});
```

---

## 2. Environment variables

You’ll typically configure PostHog with **project-level env vars** so you don’t hard‑code keys in code.

Common variable names:

- **`POSTHOG_API_KEY`** – your Project API key (starts with `phc_...`)
- **`POSTHOG_HOST`** – your PostHog host, e.g.:
  - `https://eu.i.posthog.com` (EU)
  - `https://us.i.posthog.com` (US)

Example `.env` (generic):

```dotenv
POSTHOG_API_KEY=phc_1234567890abcdef
POSTHOG_HOST=https://eu.i.posthog.com
```

### Framework‑specific notes

- **Vite / CRA / generic webpack**  
  You’ll often use a public prefix, e.g. `VITE_POSTHOG_API_KEY` or `REACT_APP_POSTHOG_API_KEY`, then pass that value down to `PosthogProvider`.

- **Next.js**  
  Use `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` if you want them available on the client and then pass them to `PosthogProvider`.

The library itself does **not** read env vars directly; you read them in your app and pass them as props.

---

## 3. Basic setup in your app

Wrap your **root React tree** with `PosthogProvider`:

```tsx
// e.g. src/main.tsx or src/index.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  PosthogProvider,
  DEFAULT_HOST,
} from "@Emit-Labs/posthog-react-tracking";

const apiKey = process.env.POSTHOG_API_KEY ?? ""; // or VITE_/NEXT_PUBLIC_/REACT_APP_ variant
const host = process.env.POSTHOG_HOST ?? DEFAULT_HOST;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PosthogProvider
      apiKey={apiKey}
      host={host}
      debug={false}
      autocapture={true} // or false if you want manual tracking only
      disableGeoip={false} // optional
    >
      <App />
    </PosthogProvider>
  </React.StrictMode>
);
```

**Props:**

- `apiKey` (required): PostHog Project API key (`phc_...`)
- `host` (optional): PostHog host, defaults to `DEFAULT_HOST` (EU)
- `debug` (optional): enable debug logs
- `autocapture` (optional): enable/disable PostHog autocapture
- `disableGeoip` (optional): disable GeoIP resolution
- `enableSessionReplay` (optional): when `true`, session recording is enabled; when `false`, it is disabled (you can still start it later via `usePosthogSessionReplay().startRecording()`)
- `sessionReplayConfig` (optional): masking options when session replay is enabled: `maskAllInputs`, `maskTextSelector`, `blockSelector` (e.g. `'img'` to mask images)
- `options` (optional): extra options forwarded to `posthog.init(...)`

### Session replay

To start recording when the app loads, render `PosthogSessionReplayStarter` inside the provider (same pattern as React Native):

```tsx
<PosthogProvider
  apiKey={apiKey}
  host={host}
  enableSessionReplay={true}
  sessionReplayConfig={{
    maskAllInputs: false,
    blockSelector: null, // or 'img' to mask images
  }}
>
  <PosthogSessionReplayStarter />
  <App />
</PosthogProvider>
```

To control recording programmatically, use `usePosthogSessionReplay()`:

```tsx
import { usePosthogSessionReplay } from "@Emit-Labs/posthog-react-tracking";

function MyComponent() {
  const { startRecording, stopRecording, isRecording, isInitialized } = usePosthogSessionReplay();
  // startRecording(), stopRecording(), isRecording() — same API as React Native
  // pauseRecording/resumeRecording are no-ops on web (posthog-js does not support them)
}
```

---

## 4. `usePosthog` – API surface

In any component under `PosthogProvider`:

```tsx
import { usePosthog } from "@Emit-Labs/posthog-react-tracking";

function MyScreen() {
  const posthog = usePosthog();

  // Event tracking (supports $screen_name, $current_url, etc.)
  posthog.track({
    name: "button_clicked",
    properties: {
      $screen_name: "MyScreen",
      $current_url: "/my-screen",
      button_name: "signup",
    },
  });

  // User identification & person properties
  posthog.identify("user-123", { email: "u@example.com" });
  posthog.setUserProperties({ plan: "pro" });
  posthog.setUserPropertiesOnce({ signup_date: "2024-01-01" });

  // Super-properties (attached to all events)
  posthog.register({ campaign: "summer" });
  posthog.unregister("campaign");

  // Feature flags
  const enabled = posthog.isFeatureEnabled("new-ui");
  const variant = posthog.getFeatureFlag("button-color");
  const payload = posthog.getFeatureFlagPayload("experiment");
  posthog.reloadFeatureFlags();
  posthog.onFeatureFlags((flags) => {
    console.log("Feature flags changed:", flags);
  });
  posthog.setPersonPropertiesForFlags({ cohort: "beta" });
  posthog.resetPersonPropertiesForFlags();

  // Consent
  posthog.optIn();
  posthog.optOut();
  const optedOut = posthog.isOptedOut();

  // Session / flushing
  posthog.reset(); // clears user + session (use on logout)
  posthog.flush(); // flush queued events (best-effort)

  if (posthog.isInitialized) {
    // safe to rely on PostHog being fully initialized
  }

  return (
    <button onClick={() => posthog.track({ name: "cta_clicked" })}>
      Sign up
    </button>
  );
}
```

**Returned object (shape mirrors your existing `posthog_service`):**

- **Event tracking**
  - `track(event: { name: string; properties?: Record<string, unknown> })`
- **Identify & person properties**
  - `identify(distinctId, properties?)`
  - `setUserProperties(properties)`
  - `setUserPropertiesOnce(properties)`
- **Super properties**
  - `register(properties?)`
  - `unregister(propertyName)`
- **Session / queue**
  - `reset()` – reset distinct ID & session (use on logout)
  - `flush()` – attempt to send queued events immediately
- **Consent**
  - `optIn()`
  - `optOut()`
  - `isOptedOut(): boolean`
- **Feature flags**
  - `isFeatureEnabled(flagKey): boolean | undefined`
  - `getFeatureFlag(flagKey): string | boolean | undefined`
  - `getFeatureFlagPayload(flagKey): unknown`
  - `reloadFeatureFlags()`
  - `reloadFeatureFlagsAsync(): Promise<string[]>` (utility wrapper)
  - `onFeatureFlags(callback): () => void`
  - `setPersonPropertiesForFlags(properties, reloadFlags?)`
  - `resetPersonPropertiesForFlags()`
- **Status**
  - `isInitialized: boolean`

If `PosthogProvider` is not mounted or not initialized, `usePosthog()` returns a **no-op implementation** (all methods exist but do nothing, `isInitialized === false`), so it is safe to call without extra guards.

---

## 5. Typical patterns

### Screen / page tracking

You can standardize screen/page tracking:

```tsx
import { useEffect } from "react";
import { usePosthog } from "@Emit-Labs/posthog-react-tracking";

function Screen({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const posthog = usePosthog();

  useEffect(() => {
    posthog.track({
      name: "$pageview",
      properties: {
        $screen_name: name,
        $current_url: window.location.pathname + window.location.search,
      },
    });
  }, [name, posthog]);

  return <>{children}</>;
}
```

### Guarding on initialization (optional)

```tsx
const posthog = usePosthog();

if (!posthog.isInitialized) {
  // show fallback UI or skip analytics-sensitive logic
}
```

---

## 6. Build & distribution

### Local build

```bash
yarn install
yarn build
# or
npm install
npm run build
```

Build output:

- `dist/index.js` – CJS
- `dist/index.mjs` – ESM
- `dist/index.d.ts` / `dist/index.d.mts` – TypeScript types

The library’s `package.json` should point:

- `"main": "dist/index.js"`
- `"module": "dist/index.mjs"`
- `"types": "dist/index.d.ts"`

### Consuming from another project

1. Add this repo as a dependency (Git URL or published package).
2. Ensure `react` and `posthog-js` are installed in the consuming app.
3. Wrap your root component tree in `PosthogProvider` with your `POSTHOG_API_KEY` and `POSTHOG_HOST`.
4. Use `usePosthog()` wherever you currently use the mobile `posthog_service` hook; the API is intentionally mirrored for easier cross‑platform reuse.

---
