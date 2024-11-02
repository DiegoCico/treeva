import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function Stage1Tree() {
    // Load the GLTF model
    const gltf = useLoader(GLTFLoader, '/path/to/stage1.glb'); // Replace with the actual path to stage1.glb

    // Create the material for the tree (optional, if you want to override the material from the model)
    const treeMaterial = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 1,
        metalness: 0,
    });

    // Apply the material to the model (if needed)
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material = treeMaterial;
            child.material.needsUpdate = true;
        }
    });

    return <primitive object={gltf.scene} position={[0, 0.5, 0]} scale={1} />;
}

export default function IslandScene() {
    return (
        <Canvas
            camera={{ position: [5, 5, 10], fov: 75 }}
            style={{ width: '100%', height: 'calc(100vh - 150px)' }}
        >
            {/* Use Suspense for async loading of the GLTF model */}
            <Suspense fallback={<span>Loading...</span>}>
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Island base */}
                <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
                    <cylinderGeometry args={[5, 5, 0.5, 6]} />
                    <meshStandardMaterial color="#8B4513" />
                </mesh>

                {/* Render the GLTF tree model */}
                <Stage1Tree />
            </Suspense>

            {/* Orbit controls for rotating the scene */}
            <OrbitControls />
        </Canvas>
    );
}
