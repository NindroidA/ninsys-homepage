import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { navigationCards } from "../assets/navigationCards";
import FooterComponent from "../components/Footer";
import NavigationCards from "../components/NavigationCards";
import { ServerRackLoader } from "../components/ServerRackLoader";
import ServiceStatus from "../components/ServiceStatus";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { useRender3D } from "../hooks/useRender3D";

// The WebGL scene (three.js + drei + fiber) is a separate lazy chunk so it never
// ships in the initial bundle and is only fetched on devices that render it.
const ServerRackScene = lazy(() => import("../components/ServerRackScene"));

export default function Homepage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLElement>(null);
  const render3D = useRender3D();
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const hasLoggedError = useRef(false);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  const handleSceneError = useCallback((error?: Error) => {
    // Log only once (StrictMode can cause double calls)
    if (!hasLoggedError.current) {
      hasLoggedError.current = true;
      console.warn("3D scene error - hiding canvas", error?.message || "");
    }
    setSceneError(true);
    setIsSceneReady(true);
  }, []);

  // Fallback timeout - dismiss loader after 5 seconds even if 3D fails
  useEffect(() => {
    if (!render3D || sceneError) return;

    const timeout = setTimeout(() => {
      if (!isSceneReady) {
        console.warn("3D scene load timeout - showing page without 3D");
        handleSceneError();
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [render3D, isSceneReady, sceneError, handleSceneError]);

  // Hero parallax - passive listener + rAF-batched write, skipped under reduced motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (heroRef.current) {
          heroRef.current.style.transform = `translateY(${window.scrollY * 0.5}px)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* animated floating elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000 motion-reduce:animate-none"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000 motion-reduce:animate-none"></div>
      </div>

      {/* welcome section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* background server rack: WebGL on capable devices, static poster otherwise */}
        <div className="absolute inset-0 flex items-center z-0" aria-hidden="true">
          {render3D ? (
            <>
              <AnimatePresence mode="wait">
                {!isSceneReady && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <ServerRackLoader />
                  </motion.div>
                )}
              </AnimatePresence>
              {!sceneError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isSceneReady ? 0.7 : 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  <ErrorBoundary fallback={null} onError={handleSceneError}>
                    <Suspense fallback={null}>
                      <ServerRackScene onReady={handleSceneReady} onError={handleSceneError} />
                    </Suspense>
                  </ErrorBoundary>
                </motion.div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-70">
              <ServerRackLoader animated={false} label="" />
            </div>
          )}
        </div>

        {/* animated background grid */}
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        {/* header text */}
        <div ref={heroRef} className="relative z-20 text-center px-4 sm:px-8 w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 0.95, y: 0 }}
            transition={{ duration: 1.2 }}
            className="mb-8"
          >
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 md:p-20 border border-white/10 shadow-2xl">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-violet-400 via-purple-700 to-pink-300 bg-clip-text text-transparent drop-shadow-lg animate-gradient motion-reduce:animate-none">
                  Nindroid Systems
                </span>
              </h1>
              <p className="text-lg sm:text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Personal development by a silly lil guy :3
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* status section */}
      <section ref={statusRef} className="relative py-20 sm:py-32 px-4 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 backdrop-blur-3xl"></div>
        <ServiceStatus />
      </section>

      {/* nav cards section */}
      <section ref={cardsRef} className="relative py-20 px-4 sm:px-8">
        <NavigationCards cards={navigationCards} />
      </section>

      {/* footer */}
      <FooterComponent />
    </div>
  );
}
