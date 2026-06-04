import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { GuestViewBanner } from "./admin/GuestViewBanner";

export default function Layout() {
  const location = useLocation();

  // scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950">
      <GuestViewBanner />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80 motion-reduce:animate-none" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
