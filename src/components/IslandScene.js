// import React, { Suspense, useEffect, useState, useRef } from "react";
// import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
// import { OrbitControls } from '@react-three/drei';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import * as THREE from 'three';

// function getRandomColor() {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }

// function StageTree({ stage, x, z, setHoveredTree, sprintName, onClick }) {
//     const treeRef = useRef();
//     const gltf = useLoader(GLTFLoader, `/stage${stage}.gltf`);
    
//     const treeMaterial = new THREE.MeshStandardMaterial({
//         color: '#228B22',
//         roughness: 0.6,
//         metalness: 0.1
//     });

//     const y = 0.2;
//     const hexagonColor = React.useMemo(() => getRandomColor(), []);

//     gltf.scene.traverse((child) => {
//         if (child.isMesh) {
//             child.material = treeMaterial;
//             child.material.needsUpdate = true;
//         }
//     });

//     // Animation logic
//     useFrame(() => {
//         if (treeRef.current && treeRef.current.userData.isAnimating) {
//             treeRef.current.rotation.y += 0.05; // Rotate the tree on Y-axis
//             treeRef.current.position.y += 0.02; // Rise the tree
//             if (treeRef.current.position.y > 3) {
//                 treeRef.current.userData.isAnimating = false;
//             }
//         }
//     });

//     return (
//         <group
//             ref={treeRef}
//             position={[x, y, z]}
//             onPointerOver={() => setHoveredTree({ sprintName, x: x + 1.5, y: y + 2.5, z })}
//             onPointerOut={() => setHoveredTree(null)}
//             onClick={() => onClick(treeRef, x, y, z)}
//         >
//             {/* Render the tree model */}
//             <primitive object={gltf.scene.clone()} scale={1} />

//             {/* Render the small hexagon with random color */}
//             <mesh rotation={[0, 0, 0]} position={[0, 0.15, 0]}>
//                 <cylinderGeometry args={[1, 1, 0.1, 6]} />
//                 <meshStandardMaterial color={hexagonColor} />
//             </mesh>
//         </group>
//     );
// }

// function CameraAnimation({ shouldAnimateCamera, animatedTreeRef, orbitControlsRef }) {
//     const { camera } = useThree();

//     useFrame(() => {
//         if (shouldAnimateCamera.current && animatedTreeRef.current) {
//             // Update the camera position to follow the tree
//             const targetPos = new THREE.Vector3(
//                 animatedTreeRef.current.position.x,
//                 animatedTreeRef.current.position.y + 2,
//                 animatedTreeRef.current.position.z + 5
//             );
//             camera.position.lerp(targetPos, 0.05);
//             camera.lookAt(animatedTreeRef.current.position.x, animatedTreeRef.current.position.y, animatedTreeRef.current.position.z);
//             if (orbitControlsRef.current) {
//                 orbitControlsRef.current.target.lerp(animatedTreeRef.current.position, 0.05);
//                 orbitControlsRef.current.update();
//             }
//             if (camera.position.distanceTo(targetPos) < 0.1) {
//                 shouldAnimateCamera.current = false;
//                 if (orbitControlsRef.current) {
//                     orbitControlsRef.current.enabled = true; // Re-enable controls after animation
//                 }
//             }
//         }
//     });

//     return null;
// }

// export default function IslandScene({ sprintsData }) {
//     const [hoveredTree, setHoveredTree] = useState(null);
//     const shouldAnimateCamera = useRef(false);
//     const animatedTreeRef = useRef(null);
//     const orbitControlsRef = useRef(null);

//     useEffect(() => {
//         const canvasElement = document.querySelector('canvas');

//         const handleContextLost = (event) => {
//             event.preventDefault();
//             console.warn("WebGL context lost. Attempting to restore...");
//         };

//         const handleContextRestored = () => {
//             console.info("WebGL context restored.");
//         };

//         canvasElement.addEventListener('webglcontextlost', handleContextLost);
//         canvasElement.addEventListener('webglcontextrestored', handleContextRestored);

//         return () => {
//             canvasElement.removeEventListener('webglcontextlost', handleContextLost);
//             canvasElement.removeEventListener('webglcontextrestored', handleContextRestored);
//         };
//     }, []);

//     // Define positions for up to 5 trees, evenly spread out on the plot
//     const treePositions = [
//         [-2.8, -2],
//         [2.8, -2],
//         [-2.8, 2],
//         [2.2, 2.2],
//         [0, 0]
//     ];

//     const getSprintStage = (sprint) => {
//         let stage;
//         if (sprint.sprintProgress <= 25) {
//             stage = 1;
//         } else if (sprint.sprintProgress > 25 && sprint.sprintProgress <= 50) {
//             stage = 2;
//         } else if (sprint.sprintProgress > 50 && sprint.sprintProgress <= 75) {
//             stage = 3;
//         } else {
//             stage = 4;
//         }

//         return stage;
//     };

//     const handleTreeClick = (treeRef, x, y, z) => {
//         if (treeRef.current) {
//             // Set the animation flag
//             treeRef.current.userData.isAnimating = true;

//             // Set target position for camera animation
//             animatedTreeRef.current = treeRef.current;
//             shouldAnimateCamera.current = true;
//             if (orbitControlsRef.current) {
//                 orbitControlsRef.current.enabled = false; // Disable controls during animation
//             }
//         }
//     };

//     return (
//         <>
//             <Suspense fallback={<div>Loading...</div>}>
//                 <Canvas
//                     camera={{ position: [5, 5, 10], fov:  50}}
//                     style={{ width: '100%', height: 'calc(100vh - 150px)' }}
//                     gl={{ preserveDrawingBuffer: true }}
//                     dpr={Math.min(window.devicePixelRatio, 2)}
//                 >
//                     <ambientLight intensity={0.6} />
//                     <directionalLight position={[10, 10, 5]} intensity={1} />

//                     <group>
//                         {/* Brown base */}
//                         <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
//                             <cylinderGeometry args={[5, 5, 0.5, 6]} />
//                             <meshStandardMaterial color="#8B4513" />
//                         </mesh>
//                         {/* Grass layer */}
//                         <mesh rotation={[0, 0, 0]} position={[0, 0.30, 0]}>
//                             <cylinderGeometry args={[5, 5, 0.1, 6]} />
//                             <meshStandardMaterial color="#27AE60" />
//                         </mesh>
//                     </group>

//                     {Array.from({ length: sprintsData.length }).map((_, index) => (
//                         <StageTree
//                             key={index}
//                             stage={getSprintStage(sprintsData[index])}
//                             x={treePositions[index % treePositions.length][0]}
//                             z={treePositions[index % treePositions.length][1]}
//                             setHoveredTree={setHoveredTree}
//                             sprintName={sprintsData[index].name}
//                             onClick={handleTreeClick}
//                         />
//                     ))}

//                     <CameraAnimation shouldAnimateCamera={shouldAnimateCamera} animatedTreeRef={animatedTreeRef} orbitControlsRef={orbitControlsRef} />

//                     <OrbitControls ref={orbitControlsRef} enablePan={false} enableZoom={false} />
//                 </Canvas>
//             </Suspense>

//             {/* Tooltip */}
//             {hoveredTree && hoveredTree.sprintName && (
//                 <div
//                     style={{
//                         position: 'absolute',
//                         top: `calc(50% + ${hoveredTree.y * 10}px)`,
//                         left: `calc(50% + ${hoveredTree.x * 10}px)`,
//                         transform: 'translate(-50%, -50%)',
//                         padding: '10px',
//                         background: 'rgba(0, 0, 0, 0.7)',
//                         color: 'white',
//                         borderRadius: '5px',
//                         fontWeight: 'bold'
//                     }}
//                 >
//                     {hoveredTree.sprintName}
//                 </div>
//             )}
//         </>
//     );
// }




import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
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

function StageTree({ stage, x, z, setHoveredTree, sprintName, onClick }) {
    const treeRef = useRef();
    const gltf = useLoader(GLTFLoader, `/stage${stage}.gltf`);
    
    const treeMaterial = new THREE.MeshStandardMaterial({
        color: '#228B22',
        roughness: 0.6,
        metalness: 0.1
    });

    const y = 0.2;
    const hexagonColor = React.useMemo(() => getRandomColor(), []);

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material = treeMaterial;
            child.material.needsUpdate = true;
        }
    });

    // Animation logic
    useFrame(() => {
        if (treeRef.current && treeRef.current.userData.isAnimating) {
            treeRef.current.rotation.y += 0.05; // Rotate the tree on Y-axis
            treeRef.current.position.y += 0.02; // Rise the tree
            if (treeRef.current.position.y > 3) {
                treeRef.current.userData.isAnimating = false;
            }
        }
    });

    return (
        <group
            ref={treeRef}
            position={[x, y, z]}
            onPointerOver={() => setHoveredTree({ sprintName, x: x - 1.5, y: y + 2.5, z })}
            onPointerOut={() => setHoveredTree(null)}
            onClick={() => onClick(treeRef, x, y, z)}
        >
            {/* Render the tree model */}
            <primitive object={gltf.scene.clone()} scale={1} />

            {/* Render the small hexagon with random color */}
            <mesh rotation={[0, 0, 0]} position={[0, 0.15, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 6]} />
                <meshStandardMaterial color={hexagonColor} />
            </mesh>
        </group>
    );
}

function CameraAnimation({ shouldAnimateCamera, animatedTreeRef, orbitControlsRef }) {
    const { camera } = useThree();

    useFrame(() => {
        if (shouldAnimateCamera.current && animatedTreeRef.current) {
            // Update the camera position to follow the tree
            const targetPos = new THREE.Vector3(
                animatedTreeRef.current.position.x,
                animatedTreeRef.current.position.y + 7, // Increase height of camera when it rises
                animatedTreeRef.current.position.z + 5
            );
            camera.position.lerp(targetPos, 0.03); // Make the zoom in slower
            camera.lookAt(animatedTreeRef.current.position.x, animatedTreeRef.current.position.y, animatedTreeRef.current.position.z);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.lerp(animatedTreeRef.current.position, 0.05);
                orbitControlsRef.current.update();
            }
            if (camera.position.distanceTo(targetPos) < 0.1) {
                shouldAnimateCamera.current = false;
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enabled = true; // Re-enable controls after animation
                }
            }
        }
    });

    return null;
}

export default function IslandScene({ sprintsData }) {
    const [hoveredTree, setHoveredTree] = useState(null);
    const shouldAnimateCamera = useRef(false);
    const animatedTreeRef = useRef(null);
    const orbitControlsRef = useRef(null);

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

    // Define positions for up to 5 trees, evenly spread out on the plot
    const treePositions = [
        [-2.8, -2],
        [2.8, -2],
        [-2.8, 2],
        [2.2, 2.2],
        [0, 0]
    ];

    const getSprintStage = (sprint) => {
        let stage;
        if (sprint.sprintProgress <= 25) {
            stage = 1;
        } else if (sprint.sprintProgress > 25 && sprint.sprintProgress <= 50) {
            stage = 2;
        } else if (sprint.sprintProgress > 50 && sprint.sprintProgress <= 75) {
            stage = 3;
        } else {
            stage = 4;
        }

        return stage;
    };

    const handleTreeClick = (treeRef, x, y, z) => {
        if (treeRef.current) {
            // Set the animation flag
            treeRef.current.userData.isAnimating = true;

            // Set target position for camera animation
            animatedTreeRef.current = treeRef.current;
            shouldAnimateCamera.current = true;
            if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false; // Disable controls during animation
            }
        }
    };

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <Canvas
                    camera={{ position: [5, 1, 10], fov: 45 }} // Raise initial camera height
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

                    {Array.from({ length: sprintsData.length }).map((_, index) => (
                        <StageTree
                            key={index}
                            stage={getSprintStage(sprintsData[index])}
                            x={treePositions[index % treePositions.length][0]}
                            z={treePositions[index % treePositions.length][1]}
                            setHoveredTree={setHoveredTree}
                            sprintName={sprintsData[index].name}
                            onClick={handleTreeClick}
                        />
                    ))}

                    <CameraAnimation shouldAnimateCamera={shouldAnimateCamera} animatedTreeRef={animatedTreeRef} orbitControlsRef={orbitControlsRef} />

                    <OrbitControls ref={orbitControlsRef} enablePan={false} enableZoom={false} />
                </Canvas>
            </Suspense>

            {/* Tooltip */}
            {hoveredTree && hoveredTree.sprintName && (
                <div
                    style={{
                        position: 'absolute',
                        top: `calc(50% + ${hoveredTree.y * 10}px)`,
                        left: `calc(50% + ${hoveredTree.x * 10}px)`,
                        transform: 'translate(-50%, -50%)',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    {hoveredTree.sprintName}
                </div>
            )}
        </>
    );
}


