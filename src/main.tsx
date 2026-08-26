import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { queryClient } from "./lib/queryClient";
import Pages from "./pages/index.tsx";

// ErrorBoundary wraps the providers: without it any render throw unmounts the
// whole tree and leaves a blank page.
// biome-ignore lint/style/noNonNullAssertion: the #root element is guaranteed by index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SiteConfigProvider>
            <Pages />
          </SiteConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
