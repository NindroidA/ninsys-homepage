import type { JSX } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Seo } from "../../components/Seo";
import { useAuth } from "../../hooks/useAuth";
import { AdminHosted } from "./AdminHosted";
import { AdminLogin } from "./AdminLogin";
import { AdminOverview } from "./AdminOverview";
import { AdminProjects } from "./AdminProjects";
import { AdminServices } from "./AdminServices";
import { AdminSiteConfig } from "./AdminSiteConfig";
import { AdminUtilities } from "./AdminUtilities";

/**
 * The admin area. Mounted at `/admin/*` outside the public Layout so it has its
 * own chrome. Gated behind TOTP auth — unauthenticated visitors get the login
 * screen instead of the dashboard.
 */
export default function AdminApp(): JSX.Element {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Seo title="Admin" />
        <AdminLogin />
      </>
    );
  }

  return (
    <>
      <Seo title="Admin" />
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="site" element={<AdminSiteConfig />} />
          <Route path="hosted" element={<AdminHosted />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="utilities" element={<AdminUtilities />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  );
}
