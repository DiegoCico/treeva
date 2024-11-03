// import React, { Suspense, useEffect, useState } from "react";
// import { Canvas, useLoader } from "@react-three/fiber";
// import { OrbitControls } from '@react-three/drei';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import * as THREE from 'three';

// // Function to generate random colors
// function getRandomColor() {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }

// function StageTree({ stage, x, z, setHoveredTree }) {
//     const gltf = useLoader(GLTFLoader, `/stage${stage}.gltf`); // Replace with the actual path to your model
//     const treeMaterial = new THREE.MeshStandardMaterial({
//         color: '#228B22',
//         roughness: 0.6,
//         metalness: 0.1
//     });

//     const y = 0.2

//     // Traverse the model and apply the material
//     gltf.scene.traverse((child) => {
//         if (child.isMesh) {
//             child.material = treeMaterial;
//             child.material.needsUpdate = true;
//         }
//     });

//     return (
//         <group
//             position={[x, y, z]}
//             onPointerOver={() => setHoveredTree(`Tree at position [${x}, ${z}]`)}
//             onPointerOut={() => setHoveredTree(null)}
//         >
//             {/* Render the tree model */}
//             <primitive object={gltf.scene.clone()} position={[x, y, z]} scale={1} />
            
//             {/* Render the small hexagon with random color */}
//             <mesh rotation={[0, 0, 0]} position={[x, 0.35, z]}>
//                 <cylinderGeometry args={[1, 1, 0.1, 6]} />
//                 <meshStandardMaterial color={getRandomColor()} />
//             </mesh>
//         </group>
//     );
// }

// export default function IslandScene( { sprintsData } ) {
//     const [hoveredTree, setHoveredTree] = useState(null);

//     for (let i=0; i<sprintsData.length; i++) {
//         console.log(sprintsData[i].sprintProgress)
//     }
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

//     const getSprintStage =(sprint) => {
//         let stage
//         if (sprint.sprintProgress <= 25) {
//             stage = 1
//         } else if (sprint.sprintProgress > 25 && sprint.sprintProgress <= 50) {
//             stage = 2
//         } else if (sprint.sprintProgress > 50 && sprint.sprintProgress <= 75) {
//             stage = 3
//         } else {
//             stage = 4
//         }

//         return stage
//     }

//     return (
//         <>
//             <Suspense fallback={<div>Loading...</div>}>
//                 <Canvas
//                     camera={{ position: [5, 5, 10], fov: 45 }}
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
//                         <StageTree key={index} stage={getSprintStage(sprintsData[index])} x={treePositions[index % treePositions.length][0]} z={treePositions[index % treePositions.length][1]} setHoveredTree={setHoveredTree} />
//                     ))}

//                     <OrbitControls enablePan={false} enableZoom={false} />
//                 </Canvas>
//             </Suspense>
//             {hoveredTree && (
//                 <div
//                     style={{
//                         position: 'absolute',
//                         top: 10,
//                         left: 10,
//                         padding: '10px',
//                         background: 'rgba(0, 0, 0, 0.7)',
//                         color: 'white',
//                         borderRadius: '5px'
//                     }}
//                 >
//                     {hoveredTree}
//                 </div>
//             )}
//         </>
//     );
// }


import React, { Suspense, useEffect, useState } from "react";
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

function StageTree({ stage, x, z, setHoveredTree }) {
    const gltf = useLoader(GLTFLoader, `/stage${stage}.gltf`); // Replace with the actual path to your model
    const treeMaterial = new THREE.MeshStandardMaterial({
        color: '#228B22',
        roughness: 0.6,
        metalness: 0.1
    });

    const y = 0.2;

    // Traverse the model and apply the material
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material = treeMaterial;
            child.material.needsUpdate = true;
        }
    });

    return (
        <group
            position={[x, y, z]}
            onPointerOver={() => setHoveredTree(`Tree at position [${x}, ${z}]`)}
            onPointerOut={() => setHoveredTree(null)}
        >
            {/* Render the tree model */}
            <primitive object={gltf.scene.clone()} scale={1} />

            {/* Render the small hexagon with random color */}
            <mesh rotation={[0, 0, 0]} position={[0, 0.15, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 6]} />
                <meshStandardMaterial color={getRandomColor()} />
            </mesh>
        </group>
    );
}

export default function IslandScene({ sprintsData }) {
    const [hoveredTree, setHoveredTree] = useState(null);

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

    return (
        <>
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

                    {Array.from({ length: sprintsData.length }).map((_, index) => (
                        <StageTree
                            key={index}
                            stage={getSprintStage(sprintsData[index])}
                            x={treePositions[index % treePositions.length][0]}
                            z={treePositions[index % treePositions.length][1]}
                            setHoveredTree={setHoveredTree}
                        />
                    ))}

                    <OrbitControls enablePan={false} enableZoom={false} />
                </Canvas>
            </Suspense>

            {/* Tooltip */}
            {hoveredTree && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        borderRadius: '5px'
                    }}
                >
                    {hoveredTree}
                </div>
            )}
        </>
    );
}
