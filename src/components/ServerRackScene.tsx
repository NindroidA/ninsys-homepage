import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { DataStream, NetworkNodes, ServerRack } from "./ServerRack";

interface SceneProps {
  onReady?: () => void;
}

function Scene({ onReady }: SceneProps) {
  useEffect(() => {
    // Signal that the scene is ready after a short delay.
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
      <directionalLight position={[30, 30, 20]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 10, 10]} intensity={0.8} color="#8b5cf6" />

      <ServerRack />
      <NetworkNodes />
      <DataStream />

      <Environment preset="studio" />
    </>
  );
}

interface ServerRackSceneProps {
  onReady?: () => void;
  onError?: (error?: Error) => void;
}

/**
 * The WebGL homepage scene. Imported lazily so three.js / drei / fiber land in a
 * separate async chunk that only loads on devices that actually render it.
 */
export default function ServerRackScene({ onReady, onError }: ServerRackSceneProps) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      gl={{
        antialias: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e: Event) => {
          e.preventDefault();
          onError?.();
        });
      }}
    >
      <Scene onReady={onReady} />
    </Canvas>
  );
}
