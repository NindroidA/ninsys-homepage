import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// THE server rack component
export function ServerRack() {
    const groupRef = useRef<THREE.Group>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    
    useFrame((state) => {
        if (groupRef.current && !isUserInteracting) {
            groupRef.current.rotation.y += 0.008;
        }
    });

    return (
        <group ref={groupRef} scale={[-5, -5, -5]} position={[0, -5, -30]}>
            {/* server rack frame */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3, 6, 2]} />
                <meshStandardMaterial
                color="#1a1d20"
                metalness={0.9}
                roughness={0.1}
                />
            </mesh>

            {/* server units */}
            {Array.from({ length: 12 }, (_, i) => (
                <group key={i} position={[0, 1.8 - i * 0.35, 0]}>
                    <mesh position={[0, 0, 0.9]}>
                        <boxGeometry args={[2.5, 0.22, 0.25]} />
                        <meshStandardMaterial
                        color="#2a2d31"
                        metalness={0.95}
                        roughness={0.05}
                        />
                    </mesh>
                    
                    {/* LED indicators */}
                    {Array.from({ length: 4 }, (_, j) => (
                        <mesh key={j} position={[0.75 - j * 0.5, 0, 1.02]}>
                            <sphereGeometry args={[0.025]} />
                            <meshStandardMaterial
                                color={
                                j % 5 === 0 ? "#10b981" : 
                                j % 5 === 1 ? "#3b82f6" : 
                                j % 5 === 2 ? "#f59e0b" : 
                                j % 5 === 3 ? "#ef4444" : 
                                "#8b5cf6"
                                }
                                emissive={
                                j % 5 === 0 ? "#10b981" : 
                                j % 5 === 1 ? "#3b82f6" : 
                                j % 5 === 2 ? "#f59e0b" : 
                                j % 5 === 3 ? "#ef4444" : 
                                "#8b5cf6"
                                }
                                emissiveIntensity={0.6}
                            />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* ventilation grills */}
            {Array.from({ length: 8 }, (_, i) => (
                <mesh key={i} position={[-1.5, 1.5 - i * 0.4, 0.3]}>
                    <boxGeometry args={[0.03, 0.5, 0.3]} />
                    <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}

            {/* side panels */}
            <mesh position={[-1.5, 0, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.1, 4, 1.2]} />
                <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
            </mesh>
            
            <mesh position={[1.5, 0, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.1, 4, 1.2]} />
                <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
            </mesh>
        </group>
    );
}

// lil nodes floating
export function NetworkNodes() {
    const nodesRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (nodesRef.current) {
            nodesRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
        }
    });

    return (
        <group ref={nodesRef}>
            {Array.from({ length: 18 }, (_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const radius = 6 + Math.sin(i) * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (Math.random() - 0.5) * 4;
                
                return (
                    <Float key={i} speed={1 + Math.random()} rotationIntensity={0.4} floatIntensity={0.7}>
                        <mesh position={[x, y, z]}>
                            <octahedronGeometry args={[0.12 + Math.random() * 0.08]} />
                            <meshStandardMaterial
                                color={
                                i % 6 === 0 ? "#0ea5e9" : 
                                i % 6 === 1 ? "#10b981" : 
                                i % 6 === 2 ? "#f59e0b" : 
                                i % 6 === 3 ? "#8b5cf6" :
                                i % 6 === 4 ? "#ef4444" :
                                "#06b6d4"
                                }
                                emissive={
                                i % 6 === 0 ? "#0ea5e9" : 
                                i % 6 === 1 ? "#10b981" : 
                                i % 6 === 2 ? "#f59e0b" : 
                                i % 6 === 3 ? "#8b5cf6" :
                                i % 6 === 4 ? "#ef4444" :
                                "#06b6d4"
                                }
                                emissiveIntensity={0.4}
                                transparent
                                opacity={0.9}
                            />
                        </mesh>
                    </Float>
                );
            })}
        </group>
    );
}

// data stream particulates
export function DataStream() {
    const pointsRef = useRef<THREE.Points>(null);
  
    const particlesPosition = React.useMemo(() => {
        const positions = new Float32Array(400 * 3);
        
        for (let i = 0; i < 400; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;  
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
        
        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
            pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.1;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute args={[particlesPosition, 3]} attach="attributes-position" />
            </bufferGeometry>
            <pointsMaterial size={0.04} color="#0ea5e9" transparent opacity={0.7} sizeAttenuation={true} />
        </points>
    );
}