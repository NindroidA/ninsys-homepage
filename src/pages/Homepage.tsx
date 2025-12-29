import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { navigationCards } from '../assets/navigationCards';
import FooterComponent from '../components/Footer';
import NavigationCards from '../components/NavigationCards';
import { DataStream, NetworkNodes, ServerRack } from '../components/ServerRack';
import { ServerRackLoader } from '../components/ServerRackLoader';
import ServiceStatus from '../components/ServiceStatus';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';

// No upfront WebGL check - let the Canvas try to render and handle errors gracefully
// This avoids creating/destroying a test context that could interfere with the actual Canvas

interface SceneProps {
    onReady?: () => void;
}

function Scene({ onReady }: SceneProps) {
    useEffect(() => {
        // Signal that the scene is ready after a short delay
        const timer = setTimeout(() => {
            onReady?.();
        }, 500);
        return () => clearTimeout(timer);
    }, [onReady]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 10, 5]} fov={75} />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
                autoRotate={false}
            />

            {/* Simplified lighting - fewer lights for better GPU performance */}
            <ambientLight intensity={0.6} color="#4f46e5" />
            <directionalLight
                position={[30, 30, 20]}
                intensity={1.5}
                color="#ffffff"
            />
            <pointLight position={[0, 10, 10]} intensity={0.8} color="#8b5cf6" />

            <ServerRack />
            <NetworkNodes />
            <DataStream />

            <Environment preset="studio" />
        </>
    );
}

export default function Homepage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLElement>(null);
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
            console.warn('3D scene error - hiding canvas', error?.message || '');
        }
        setSceneError(true);
        setIsSceneReady(true);
    }, []);

    // Fallback timeout - dismiss loader after 5 seconds even if 3D fails
    useEffect(() => {
        if (sceneError) return; // Skip if already errored

        const timeout = setTimeout(() => {
            if (!isSceneReady) {
                console.warn('3D scene load timeout - showing page without 3D');
                handleSceneError();
            }
        }, 5000);
        return () => clearTimeout(timeout);
    }, [isSceneReady, sceneError, handleSceneError]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            // parallax effect for welcome section
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 relative overflow-hidden">
            {/* animated floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* welcome section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* background server rack with loading state */}
                <div className="absolute inset-0 flex items-center z-0">
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
                                    <Canvas
                                        style={{ width: '100%', height: '100%' }}
                                        gl={{
                                            antialias: true,
                                            powerPreference: 'default',
                                            failIfMajorPerformanceCaveat: false,
                                        }}
                                        dpr={[1, 1.5]}
                                        onCreated={({ gl }) => {
                                            gl.domElement.addEventListener('webglcontextlost', (e: Event) => {
                                                e.preventDefault();
                                                handleSceneError();
                                            });
                                        }}
                                    >
                                        <Scene onReady={handleSceneReady} />
                                    </Canvas>
                                </Suspense>
                            </ErrorBoundary>
                        </motion.div>
                    )}
                </div>
                
                {/* animated background grid */}
                <div className="absolute inset-0 opacity-10 z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                </div>
                
                {/* header text */}
                <div ref={heroRef} className="relative z-20 text-center px-8 w-full max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 0.95, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className="mb-8"
                    >
                        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-16 md:p-20 border border-white/10 shadow-2xl">
                            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8">
                                <span className="bg-gradient-to-r from-violet-400 via-purple-700 to-pink-300 bg-clip-text text-transparent drop-shadow-lg animate-gradient">
                                    Nindroid Systems
                                </span>
                            </h1>
                            <p className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                                Personal development by a silly lil guy :3
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* status section */}
            <section ref={statusRef} className="relative py-32 px-8">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 backdrop-blur-3xl"></div>
                <ServiceStatus />
            </section>

            {/* nav cards section */}
            <section ref={cardsRef} className="relative py-20 px-8">
                <NavigationCards cards={navigationCards} />
            </section>

            {/* footer */}
            <FooterComponent />
        </div>
    );
}
