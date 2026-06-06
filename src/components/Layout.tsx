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
    <div className="min-h-screen bg-[#09060f] bg-[radial-gradient(rgba(198,188,224,0.04)_1px,transparent_1.6px)] bg-size-[26px_26px]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <GuestViewBanner />
      <main id="main">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80 motion-reduce:animate-none" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
