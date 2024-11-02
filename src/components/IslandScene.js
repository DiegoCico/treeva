import React, { Suspense, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function StageTree({ stage }) {
    let pos;
    const gltf = useLoader(GLTFLoader, `/stage${stage}.gltf`); // Replace with the actual path to stage1.glb
    const treeMaterial = new THREE.MeshStandardMaterial({
        color: '#228B22',
        roughness: 0.6,
        metalness: 0.1
    });

    // Set position based on the stage
    if (stage === 1) {
        pos = [0, 1, 0];
    } else if (stage === 2) {
        pos = [0, 1.5, 0];
    } else if (stage === 3) {
        pos = [0, 1.8, 0];
    } else if (stage === 4) {
        pos = [0, 2, 0];
    }

    // Center the model by calculating the bounding box and adjusting the position
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.geometry.computeBoundingBox();
            const boundingBox = child.geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            child.geometry.translate(-center.x, -center.y, -center.z); // Move the model so its center is at the origin

            child.material = treeMaterial;
            child.material.needsUpdate = true;
        }
    });

    return (
        <>
            {/* Render the tree model */}
            <primitive object={gltf.scene} position={pos} scale={1} />
            
            {/* Render the small red hexagon */}
            <mesh rotation={[0, 0, 0]} position={[0, 0.35, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 6]} />
                <meshStandardMaterial color={getRandomColor()} />
            </mesh>
        </>
    );
}

export default function IslandScene() {
    useEffect(() => {
        const canvasElement = document.querySelector('canvas');

        const handleContextLost = (event) => {
            event.preventDefault();
            console.warn("WebGL context lost. Attempting to restore...");
        };

        const handleContextRestored = () => {
            console.info("WebGL context restored.");
        };

        canvasElement.addEventListener('webglcontextlost', handleContextLost);
        canvasElement.addEventListener('webglcontextrestored', handleContextRestored);

        return () => {
            canvasElement.removeEventListener('webglcontextlost', handleContextLost);
            canvasElement.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, []);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Canvas
                camera={{ position: [5, 5, 10], fov: 45 }}
                style={{ width: '100%', height: 'calc(100vh - 150px)' }}
                gl={{ preserveDrawingBuffer: true }}
                dpr={Math.min(window.devicePixelRatio, 2)}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                <group>
                    {/* Brown base */}
                    <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
                        <cylinderGeometry args={[5, 5, 0.5, 6]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    {/* Grass layer */}
                    <mesh rotation={[0, 0, 0]} position={[0, 0.30, 0]}>
                        <cylinderGeometry args={[5, 5, 0.1, 6]} />
                        <meshStandardMaterial color="#27AE60" />
                    </mesh>
                </group>

                <StageTree stage={4} />

                <OrbitControls enablePan={false} enableZoom={false} />
            </Canvas>
        </Suspense>
    );
}
