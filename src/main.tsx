import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { queryClient } from "./lib/queryClient";
import Pages from "./pages/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteConfigProvider>
          <Pages />
        </SiteConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
