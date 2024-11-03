import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import '../css/Homepage.css';
import HomePageHeader from '../components/HomePageHeader';
import Sprint from './Sprint';
import UserProfile from '../components/UserProfile';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import IslandScene from '../components/IslandScene';

export default function Homepage() {
    const { userId, workspaceCode } = useParams();
    const [activeButton, setActiveButton] = useState('user');
    const [userData, setUserData] = useState({});
    const [workspace, setWorkspace] = useState({});
    const [sprintStage, setSprintStage] = useState(0)
    const [currentSprints, setCurrentSprints] = useState({})

    const getUserData = async (userId) => {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUserData(userDoc.data());
            } else {
                console.log('No user found');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getWorkspaceData = async (workspaceCode) => {
        try {
            // Reference the workspace document
            const workspaceDocRef = doc(db, "workspace", workspaceCode);
            const workspaceDoc = await getDoc(workspaceDocRef);

            if (workspaceDoc.exists()) {
                setWorkspace(workspaceDoc.data());

                // Access the sprints subcollection within the workspace document
                const sprintsCollectionRef = collection(workspaceDocRef, "sprints");
                const sprintsSnapshot = await getDocs(sprintsCollectionRef);

                // Fetch all sprints and their tasks
                const sprints = await Promise.all(
                    sprintsSnapshot.docs.map(async (sprintDoc) => {
                        // Reference to the tasks subcollection within each sprint
                        const tasksCollectionRef = collection(sprintDoc.ref, "tasks");
                        const tasksSnapshot = await getDocs(tasksCollectionRef);
                        
                        // Get tasks data as an array of task dictionaries
                        const tasks = tasksSnapshot.docs.map((taskDoc) => ({
                            id: taskDoc.id,
                            ...taskDoc.data()
                        }));
                        const totalTicketsCount = tasks.reduce((sum, task) => sum + task.tickets.length, 0);

                        const closeTask = tasks.find(task => task.id === 'Close');
                        const closedTicketsCount = closeTask ? closeTask.tickets.length : 0;
                        // Return sprint data along with its tasks
                        return {
                            id: sprintDoc.id,
                            ...sprintDoc.data(),
                            tasks: tasks,
                            totalTickets: totalTicketsCount,
                            ticketsDone: closedTicketsCount,
                            sprintProgress: totalTicketsCount && closedTicketsCount ? Math.round((closedTicketsCount/totalTicketsCount)*1000) / 10 : 0
                        };
                    })
                );

                // Set state with sprints including their tasks
                setCurrentSprints(sprints);
            } else {
                console.log('No workspace found');
            }
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        if (userId) {
            getUserData(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (workspaceCode) {
            getWorkspaceData(workspaceCode);
        }
    }, [workspaceCode]);

    useEffect(() => {
        if (userData) {
            console.log(userData);
        }
    }, [userData]);


    useEffect(() => {
        if (userData) {
            console.log('----START----')
            console.log(currentSprints);
            console.log('----END----')
        }
    }, [currentSprints]);

    return (
        <div className="homepage">
            <div className="sidenav">
                <SideNav activeButton={activeButton} setActiveButton={setActiveButton} />
            </div>
            <div className="body">
                {activeButton === 'user' && (
                    <HomePageHeader message={`Hi, ${userData.name}!`} />
                )}
                {activeButton === 'sprints' && (
                    <HomePageHeader message={'Sprints'} />
                )}
                {activeButton === 'trees' && (
                    <HomePageHeader message={'Visual Progress'} />
                )}
                <div className="main">
                    {activeButton === 'user' && (
                        <UserProfile userData={userData} workspace={workspace} workspaceCode={workspaceCode} />
                    )}
                    {activeButton === 'sprints' && <Sprint />}
                    {activeButton === 'trees' && <IslandScene sprintsData={currentSprints} />}
                </div>
            </div>
        </div>
    );
}
