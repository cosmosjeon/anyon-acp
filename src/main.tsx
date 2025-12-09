import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AnalyticsErrorBoundary } from "./components/AnalyticsErrorBoundary";
import { analytics, resourceMonitor } from "./lib/analytics";
import { PostHogProvider } from "posthog-js/react";
import "./assets/shimmer.css";
import "./styles.css";
import AppIcon from "./assets/nfo/asterisk-logo.png";

// PostHog configuration (guard against missing env to avoid noisy warnings)
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
const hasPosthogConfig = Boolean(posthogKey && posthogHost);

if (!hasPosthogConfig) {
  console.warn("[PostHog] Skipping PostHogProvider: missing VITE_PUBLIC_POSTHOG_KEY or VITE_PUBLIC_POSTHOG_HOST");
}

// Initialize analytics before rendering
analytics.initialize();

// Start resource monitoring (check every 2 minutes)
resourceMonitor.startMonitoring(120000);

// Add platform-specific classes to the <html> element to enable platform-specific styling
// Browser-safe detection using navigator properties (works in Tauri and web preview)
(() => {
  if (typeof navigator === "undefined") return;
  
  const ua = navigator.userAgent?.toLowerCase() || '';
  const pl = navigator.platform?.toLowerCase() || '';
  
  const isMac = pl.includes("mac") || ua.includes("mac os x");
  const isWindows = pl.includes("win") || ua.includes("windows");
  const isLinux = (pl.includes("linux") || ua.includes("linux")) && !ua.includes("android");
  
  if (isMac) {
    document.documentElement.classList.add("is-macos");
  } else if (isWindows) {
    document.documentElement.classList.add("is-windows");
  } else if (isLinux) {
    document.documentElement.classList.add("is-linux");
  }
})();

// Set favicon to the new app icon (avoids needing /public)
(() => {
  try {
    const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const link = existing ?? document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = AppIcon;
    if (!existing) {
      document.head.appendChild(link);
    }
  } catch (_) {
    // Non-fatal if document/head is not available
  }
})();

const AppShell = (
  <ErrorBoundary>
    <AnalyticsErrorBoundary>
      <App />
    </AnalyticsErrorBoundary>
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {hasPosthogConfig ? (
      <PostHogProvider
        apiKey={posthogKey}
        options={{
          api_host: posthogHost,
          defaults: "2025-05-24",
          capture_exceptions: true,
          debug: import.meta.env.MODE === "development",
        }}
      >
        {AppShell}
      </PostHogProvider>
    ) : (
      AppShell
    )}
  </React.StrictMode>,
);
