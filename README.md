# @macro-meals/posthog-react-tracking

React (web) PostHog tracking library with an API aligned to **posthog_service**: Provider + `usePosthog` hook. Uses `posthog-js` under the hood.

## Install

From the repo (e.g. after moving this folder to its own repo):

```bash
yarn add <your-org>/posthog-react-tracking#main
# or
npm i <your-org>/posthog-react-tracking#main
```

Peer dependencies (install in your app if not already):

```bash
yarn add react posthog-js
```

## Usage

1. Wrap your app with `PosthogProvider`:

```tsx
import { PosthogProvider, DEFAULT_HOST } from '@macro-meals/posthog-react-tracking';

<PosthogProvider apiKey="phc_..." host={DEFAULT_HOST}>
  <App />
</PosthogProvider>
```

2. Use `usePosthog()` in any component (same API as posthog_service):

```tsx
import { usePosthog } from '@macro-meals/posthog-react-tracking';

function MyScreen() {
  const posthog = usePosthog();

  // Event tracking (supports $screen_name, $current_url, etc.)
  posthog.track({
    name: 'button_clicked',
    properties: { $screen_name: 'MyScreen', $current_url: '/my-screen', button_name: 'signup' },
  });

  // User identification & properties
  posthog.identify('user-123', { email: 'u@example.com' });
  posthog.setUserProperties({ plan: 'pro' });
  posthog.setUserPropertiesOnce({ signup_date: '2024-01-01' });

  // Super properties
  posthog.register({ campaign: 'summer' });
  posthog.unregister('campaign');

  // Feature flags
  const enabled = posthog.isFeatureEnabled('new-ui');
  const variant = posthog.getFeatureFlag('button-color');
  const payload = posthog.getFeatureFlagPayload('experiment');
  posthog.reloadFeatureFlags();
  posthog.onFeatureFlags((flags) => console.log(flags));
  posthog.setPersonPropertiesForFlags({ cohort: 'beta' });
  posthog.resetPersonPropertiesForFlags();

  // Consent
  posthog.optIn();
  posthog.optOut();
  const optedOut = posthog.isOptedOut();

  // Session / flush
  posthog.reset();
  await posthog.flush();

  if (posthog.isInitialized) {
    // ...
  }
}
```

## Build

```bash
yarn install
yarn build
```

Output is in `dist/` (CJS, ESM, and types). When moving this package to its own repo, publish or install from GitHub and point `main`/`module`/`types` to the `dist` files as in `package.json`.
