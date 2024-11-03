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
    const [sprintStage, setSprintStage] = useState(0);
    const [currentSprints, setCurrentSprints] = useState({});
    const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state
    const [sprintData, setSprintData] = useState([]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode); // Toggle dark mode

    const getUserData = async (userId) => {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) setUserData(userDoc.data());
            else console.log('No user found');
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchSprints = async () => {
          try {
            const sprintsRef = collection(db, `workspace/${workspaceCode}/sprints`);
            const sprintsSnapshot = await getDocs(sprintsRef);
    
            const sprints = await Promise.all(
              sprintsSnapshot.docs.map(async (sprintDoc) => {
                const sprintId = sprintDoc.id;
                const sprintInfo = sprintDoc.data();
    
                const tasksSnapshot = await getDocs(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`));
                let totalTickets = 0;
                let closedTickets = 0;
                let ticketsData = [];
                let memberStats = {}; // Track stats per member
    
                tasksSnapshot.docs.forEach((taskDoc) => {
                  const taskData = taskDoc.data();
                  const tickets = taskData.tickets || [];
                  totalTickets += tickets.length;
    
                  tickets.forEach(ticket => {
                    const createdAt = ticket.createdAt ? ticket.createdAt.toDate() : null;
                    const closedAt = ticket.closedAt ? ticket.closedAt.toDate() : null;
                    const assignee = ticket.assignee || "Unassigned";
    
                    // Update member stats
                    if (!memberStats[assignee]) {
                      memberStats[assignee] = { received: 0, closed: 0 };
                    }
                    memberStats[assignee].received += 1;
                    if (closedAt) {
                      memberStats[assignee].closed += 1;
                    }
    
                    if (createdAt) {
                      ticketsData.push({
                        createdAt: createdAt.toISOString().split('T')[0],
                        closedAt: closedAt ? closedAt.toISOString().split('T')[0] : null,
                      });
                    }
    
                    if (taskData.title === "Close") {
                      closedTickets++;
                    }
                  });
                });
    
                const closePercentage = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;
    
                return {
                  name: sprintInfo.name || sprintId,
                  totalTickets,
                  closedTickets,
                  closePercentage,
                  ticketsData,
                  memberStats,
                };
              })
            );
    
            setSprintData(sprints.reverse());
          } catch (error) {
            console.error("Error fetching sprints:", error);
            setSprintData([]);
          }
        };
    
        if (workspaceCode) {
          fetchSprints();
        }
      }, [workspaceCode]);

    const getWorkspaceData = async (workspaceCode) => {
        try {
            const workspaceDocRef = doc(db, "workspace", workspaceCode);
            const workspaceDoc = await getDoc(workspaceDocRef);
            if (workspaceDoc.exists()) {
                setWorkspace(workspaceDoc.data());
                const sprintsCollectionRef = collection(workspaceDocRef, "sprints");
                const sprintsSnapshot = await getDocs(sprintsCollectionRef);
                const sprints = await Promise.all(
                    sprintsSnapshot.docs.map(async (sprintDoc) => {
                        const tasksCollectionRef = collection(sprintDoc.ref, "tasks");
                        const tasksSnapshot = await getDocs(tasksCollectionRef);
                        const tasks = tasksSnapshot.docs.map((taskDoc) => ({
                            id: taskDoc.id,
                            ...taskDoc.data()
                        }));
                        const totalTicketsCount = tasks.reduce((sum, task) => sum + task.tickets.length, 0);
                        const closeTask = tasks.find(task => task.id === 'Close');
                        const closedTicketsCount = closeTask ? closeTask.tickets.length : 0;
                        return {
                            id: sprintDoc.id,
                            ...sprintDoc.data(),
                            tasks: tasks,
                            totalTickets: totalTicketsCount,
                            ticketsDone: closedTicketsCount,
                            sprintProgress: totalTicketsCount && closedTicketsCount ? Math.round((closedTicketsCount / totalTicketsCount) * 1000) / 10 : 0
                        };
                    })
                );
                setCurrentSprints(sprints);
                console.log(sprintData)
            } else {
                console.log('No workspace found');
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (userId) getUserData(userId);
    }, [userId]);

    useEffect(() => {
        if (workspaceCode) getWorkspaceData(workspaceCode);
    }, [workspaceCode]);

    return (
        <div className={`homepage ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="sidenav">
                <SideNav activeButton={activeButton} setActiveButton={setActiveButton} />
                <button onClick={toggleDarkMode} className="toggle-mode-button">
                    {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
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
                    {activeButton === 'trees' && <IslandScene sprintsData={sprintData} />}
                </div>
            </div>
        </div>
    );
}
