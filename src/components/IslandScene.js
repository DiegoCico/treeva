// import React, { Suspense, useEffect, useState, useRef } from "react";
// import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
// import { OrbitControls } from '@react-three/drei';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import * as THREE from 'three';
// import TreeLeftPopUp from './TreeLeftPopUp';
// import TreeRightPopUp from './TreeRightPopUp';

// function getRandomColor() {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }

// function StageTree({ stage, x, z, sprintName, onClick }) {
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
//             if (treeRef.current.userData.direction === 'up') {
//                 treeRef.current.rotation.y += 0.1; // Rotate the tree on Y-axis faster
//                 treeRef.current.position.y += 0.04; // Rise the tree faster

//                 // Stop animation when reaching target height
//                 if (treeRef.current.position.y > 3) {
//                     treeRef.current.position.y = 3; // Ensure it stops exactly at the target height
//                     treeRef.current.userData.isAnimating = false;
//                     treeRef.current.userData.direction = null;
//                     treeRef.current.userData.showPopups = true; // Set flag to show pop-ups immediately
//                 }
//             } else if (treeRef.current.userData.direction === 'down') {
//                 treeRef.current.rotation.y -= 0.1; // Rotate the tree on Y-axis faster
//                 treeRef.current.position.y -= 0.04; // Lower the tree faster
//                 if (treeRef.current.position.y <= 0.2) {
//                     treeRef.current.position.y = 0.2;
//                     treeRef.current.userData.isAnimating = false;
//                     treeRef.current.userData.direction = null;
//                     treeRef.current.userData.showPopups = false;
//                 }
//             }
//         }
//     });

//     return (
//         <group
//             ref={treeRef}
//             position={[x, y, z]}
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

// function CameraAnimation({ shouldAnimateCamera, animatedTreeRef, orbitControlsRef, resetCameraPosition }) {
//     const { camera } = useThree();

//     useFrame(() => {
//         if (shouldAnimateCamera.current && animatedTreeRef.current) {
//             // Update the camera position to follow the tree
//             const targetPos = new THREE.Vector3(
//                 animatedTreeRef.current.position.x + 2, // Move camera to the right when the tree reaches max height
//                 animatedTreeRef.current.position.y + 10, // Increase height of camera when it rises
//                 animatedTreeRef.current.position.z + 10
//             );
//             camera.position.lerp(targetPos, 0.1); // Make the zoom in faster
//             camera.lookAt(animatedTreeRef.current.position.x, animatedTreeRef.current.position.y, animatedTreeRef.current.position.z);
//             if (orbitControlsRef.current) {
//                 orbitControlsRef.current.target.lerp(animatedTreeRef.current.position, 0.1);
//                 orbitControlsRef.current.update();
//             }
//             if (camera.position.distanceTo(targetPos) < 0.1) {
//                 shouldAnimateCamera.current = false;
//                 if (orbitControlsRef.current) {
//                     orbitControlsRef.current.enabled = true; // Re-enable controls after animation
//                 }
//             }
//         } else if (resetCameraPosition.current) {
//             // Reset camera to original position when lowering the tree
//             const initialCameraPos = new THREE.Vector3(5, 10, 10);
//             camera.position.lerp(initialCameraPos, 0.1);
//             orbitControlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
//             orbitControlsRef.current.update();

//             if (camera.position.distanceTo(initialCameraPos) < 0.1) {
//                 resetCameraPosition.current = false;
//             }
//         }
//     });

//     return null;
// }

// export default function IslandScene({ sprintsData }) {
//     const shouldAnimateCamera = useRef(false);
//     const resetCameraPosition = useRef(false);
//     const animatedTreeRef = useRef(null);
//     const orbitControlsRef = useRef(null);
//     const previousTreeRef = useRef(null);
//     const [currentTreeAnimating, setCurrentTreeAnimating] = useState(null); // To keep track of which tree is animating
//     const [showPopups, setShowPopups] = useState(false); // Control pop-up visibility
//     const [currentSprint, setCurrentSprint] = useState({})

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
//         if (sprint.closePercentage <= 25) {
//             stage = 1;
//         } else if (sprint.closePercentage > 25 && sprint.closePercentage <= 50) {
//             stage = 2;
//         } else if (sprint.closePercentage > 50 && sprint.closePercentage <= 75) {
//             stage = 3;
//         } else {
//             stage = 4;
//         }

//         return stage;
//     };

//     const handleTreeClick = (treeRef, clickedSprint) => {
//         if (treeRef.current) {
//             // Lower the previous tree if it's different from the current one
//             if (previousTreeRef.current && previousTreeRef.current !== treeRef.current) {
//                 previousTreeRef.current.userData.isAnimating = true;
//                 previousTreeRef.current.userData.direction = 'down';
//                 resetCameraPosition.current = false; // Keep camera focused until pop-ups are clicked
//             }

//             // Set the animation flag for the new tree
//             treeRef.current.userData.isAnimating = true;
//             treeRef.current.userData.direction = 'up';
//             setCurrentTreeAnimating(treeRef.current); // Set current animating tree for popup visibility

//             // Set target position for camera animation
//             animatedTreeRef.current = treeRef.current;
//             shouldAnimateCamera.current = true;
//             if (orbitControlsRef.current) {
//                 orbitControlsRef.current.enabled = false; // Disable controls during animation
//             }

//             // Update the previous tree reference
//             previousTreeRef.current = treeRef.current;

//             // Update state to show pop-ups when the tree animation completes
//             setShowPopups(true);
//         }
//         setCurrentSprint(clickedSprint)
//     };

//     const handlePopupClick = () => {
//         if (currentTreeAnimating) {
//             // Lower the current tree when clicking on pop-ups
//             currentTreeAnimating.userData.isAnimating = true;
//             currentTreeAnimating.userData.direction = 'down';
//             setCurrentTreeAnimating(null);
//             resetCameraPosition.current = true; // Indicate that we need to reset the camera
//             setShowPopups(false); // Hide pop-ups when tree goes back down
//         }
//     };

//     return (
//         <>
//             <Suspense fallback={<div>Loading...</div>}>
//                 <Canvas
//                     camera={{ position: [5, 10, 10], fov: 45 }} // Raise initial camera height
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
//                             sprintName={sprintsData[index].name}
//                             onClick={(treeRef) => handleTreeClick(treeRef, sprintsData[index])}
//                         />
//                     ))}

//                     <CameraAnimation shouldAnimateCamera={shouldAnimateCamera} animatedTreeRef={animatedTreeRef} orbitControlsRef={orbitControlsRef} resetCameraPosition={resetCameraPosition} />

//                     <OrbitControls ref={orbitControlsRef} enablePan={false} enableZoom={false} />
//                 </Canvas>
//             </Suspense>

//             {/* Popups */}
//             {showPopups && currentTreeAnimating && (
//                 <>
//                     <div onClick={handlePopupClick}>
//                         <TreeLeftPopUp currentSprint={currentSprint}/>
//                     </div>
//                     <div onClick={handlePopupClick}>
//                         <TreeRightPopUp />
//                     </div>
//                 </>
//             )}
//         </>
//     );
// }

import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import TreeLeftPopUp from './TreeLeftPopUp';
import TreeRightPopUp from './TreeRightPopUp';

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function StageTree({ stage, x, z, sprintName, onClick }) {
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
            if (treeRef.current.userData.direction === 'up') {
                treeRef.current.rotation.y += 0.1;
                treeRef.current.position.y += 0.04;

                // Stop animation when reaching target height
                if (treeRef.current.position.y > 3) {
                    treeRef.current.position.y = 3;
                    treeRef.current.userData.isAnimating = false;
                    treeRef.current.userData.direction = null;
                    treeRef.current.userData.showPopups = true;
                }
            } else if (treeRef.current.userData.direction === 'down') {
                treeRef.current.rotation.y -= 0.1;
                treeRef.current.position.y -= 0.04;
                if (treeRef.current.position.y <= 0.2) {
                    treeRef.current.position.y = 0.2;
                    treeRef.current.userData.isAnimating = false;
                    treeRef.current.userData.direction = null;
                    treeRef.current.userData.showPopups = false;
                }
            }
        }
    });

    return (
        <group
            ref={treeRef}
            position={[x, y, z]}
            onClick={() => onClick(treeRef, sprintName)}
        >
            <primitive object={gltf.scene.clone()} scale={1} />
            <mesh rotation={[0, 0, 0]} position={[0, 0.15, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 6]} />
                <meshStandardMaterial color={hexagonColor} />
            </mesh>
        </group>
    );
}

function CameraAnimation({ shouldAnimateCamera, animatedTreeRef, orbitControlsRef, resetCameraPosition }) {
    const { camera } = useThree();

    useFrame(() => {
        if (shouldAnimateCamera.current && animatedTreeRef.current) {
            // Update the camera position to follow the tree
            const targetPos = new THREE.Vector3(
                animatedTreeRef.current.position.x + 2,
                animatedTreeRef.current.position.y + 10,
                animatedTreeRef.current.position.z + 10
            );
            camera.position.lerp(targetPos, 0.1);
            camera.lookAt(animatedTreeRef.current.position.x, animatedTreeRef.current.position.y, animatedTreeRef.current.position.z);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.lerp(animatedTreeRef.current.position, 0.1);
                orbitControlsRef.current.update();
            }
            if (camera.position.distanceTo(targetPos) < 0.1) {
                shouldAnimateCamera.current = false;
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enabled = true;
                }
            }
        } else if (resetCameraPosition.current) {
            // Reset camera to original position when lowering the tree
            const initialCameraPos = new THREE.Vector3(5, 10, 10);
            camera.position.lerp(initialCameraPos, 0.1);
            orbitControlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            orbitControlsRef.current.update();

            if (camera.position.distanceTo(initialCameraPos) < 0.1) {
                resetCameraPosition.current = false;
            }
        }
    });

    return null;
}

export default function IslandScene({ sprintsData }) {
    const shouldAnimateCamera = useRef(false);
    const resetCameraPosition = useRef(false);
    const animatedTreeRef = useRef(null);
    const orbitControlsRef = useRef(null);
    const previousTreeRef = useRef(null);
    const [currentTreeAnimating, setCurrentTreeAnimating] = useState(null);
    const [showPopups, setShowPopups] = useState(false);
    const [currentSprint, setCurrentSprint] = useState({});

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
        if (sprint.closePercentage <= 25) {
            stage = 1;
        } else if (sprint.closePercentage > 25 && sprint.closePercentage <= 50) {
            stage = 2;
        } else if (sprint.closePercentage > 50 && sprint.closePercentage <= 75) {
            stage = 3;
        } else {
            stage = 4;
        }

        return stage;
    };

    const handleTreeClick = (treeRef, clickedSprint) => {
        if (treeRef.current) {
            if (previousTreeRef.current && previousTreeRef.current !== treeRef.current) {
                previousTreeRef.current.userData.isAnimating = true;
                previousTreeRef.current.userData.direction = 'down';
                resetCameraPosition.current = false;
            }

            treeRef.current.userData.isAnimating = true;
            treeRef.current.userData.direction = 'up';
            setCurrentTreeAnimating(treeRef.current);

            animatedTreeRef.current = treeRef.current;
            shouldAnimateCamera.current = true;

            if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false;
            }

            previousTreeRef.current = treeRef.current;

            // Update state to show pop-ups when the tree animation completes
            setShowPopups(true);

            // Set current sprint data to be passed to the pop-ups
            setCurrentSprint(clickedSprint);
        }
    };

    const handlePopupClick = () => {
        if (currentTreeAnimating) {
            currentTreeAnimating.userData.isAnimating = true;
            currentTreeAnimating.userData.direction = 'down';
            setCurrentTreeAnimating(null);
            resetCameraPosition.current = true;
            setShowPopups(false);
        }
    };

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <Canvas
                    camera={{ position: [5, 10, 10], fov: 45 }}
                    style={{ width: '100%', height: 'calc(100vh - 150px)' }}
                    gl={{ preserveDrawingBuffer: true }}
                    dpr={Math.min(window.devicePixelRatio, 2)}
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />

                    <group>
                        <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
                            <cylinderGeometry args={[5, 5, 0.5, 6]} />
                            <meshStandardMaterial color="#8B4513" />
                        </mesh>
                        <mesh rotation={[0, 0, 0]} position={[0, 0.30, 0]}>
                            <cylinderGeometry args={[5, 5, 0.1, 6]} />
                            <meshStandardMaterial color="#27AE60" />
                        </mesh>
                    </group>

                    {sprintsData.map((sprint, index) => (
                        <StageTree
                            key={index}
                            stage={getSprintStage(sprint)}
                            x={treePositions[index % treePositions.length][0]}
                            z={treePositions[index % treePositions.length][1]}
                            sprintName={sprint.name}
                            onClick={(treeRef) => handleTreeClick(treeRef, sprint)}
                        />
                    ))}

                    <CameraAnimation shouldAnimateCamera={shouldAnimateCamera} animatedTreeRef={animatedTreeRef} orbitControlsRef={orbitControlsRef} resetCameraPosition={resetCameraPosition} />

                    <OrbitControls ref={orbitControlsRef} enablePan={false} enableZoom={false} />
                </Canvas>
            </Suspense>

            {/* Popups */}
            {showPopups && currentTreeAnimating && (
                <>
                    <div onClick={handlePopupClick}>
                        <TreeLeftPopUp currentSprint={currentSprint} />
                    </div>
                    <div onClick={handlePopupClick}>
                        <TreeRightPopUp currentSprint={currentSprint} />
                    </div>
                </>
            )}
        </>
    );
}
