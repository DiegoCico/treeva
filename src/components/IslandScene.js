import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export default function IslandScene() {
    return (
        <Canvas
            camera={{ position: [5, 5, 10], fov: 75 }}
            // style={{ width: '100%', height: '100vh' }}
            style={{ width: '100%', height: 'calc(100vh - 150px)' }}
        >
            <ambientLight intensity={0.3} />
            {/* Directional light to cast shadows */}
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* Island base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <cylinderGeometry args={[5, 5, 0.5, 6]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Trees as cones */}
            {[...Array(3)].map((_, index) => (
                <mesh
                    key={index}
                    position={[Math.random() * 4 - 2, 1, Math.random() * 4 - 2]}
                >
                    <coneGeometry args={[0.5, 2, 8]} />
                    <meshStandardMaterial color="#228B22" />
                </mesh>
            ))}

            {/* Orbit controls for rotating the scene */}
            <OrbitControls />
        </Canvas>
    )
}