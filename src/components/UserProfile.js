import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import '../css/UserProfile.css';

export default function UserProfile({ userData, workspace, workspaceCode }) {
    const members = workspace.members || []; // Array of user IDs
    const [teamMembers, setTeamMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(0); // Start at 0 to recalculate accurately

    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (members.length > 0) {
                try {
                    const memberPromises = members.map(async (memberId) => {
                        const memberDocRef = doc(db, "users", memberId);
                        const memberDoc = await getDoc(memberDocRef);
                        return memberDoc.exists()
                            ? { id: memberId, name: memberDoc.data().name || "{No name}" }
                            : { id: memberId, name: "{User not found}" };
                    });
                    const membersData = await Promise.all(memberPromises);
                    setTeamMembers(membersData);
                } catch (error) {
                    console.error("Error fetching team members:", error);
                }
            }
        };

        const fetchCurrentSprintTasks = async () => {
            try {
                // Fetch the current sprint with hasEnded set to false
                const sprintQuery = query(collection(db, "workspace", workspaceCode, "sprints"), where("hasEnded", "==", false));
                const sprintSnapshot = await getDocs(sprintQuery);
                const currentSprint = sprintSnapshot.docs[0];

                if (!currentSprint) {
                    console.warn("No active sprint found.");
                    return;
                }

                const currentSprintName = currentSprint.id;

                // Fetch tasks within the current sprint, assuming tickets are embedded in each task
                const tasksSnapshot = await getDocs(collection(db, "workspace", workspaceCode, "sprints", currentSprintName, "tasks"));
                const tasksData = tasksSnapshot.docs.map((taskDoc) => {
                    const taskData = taskDoc.data();
                    return { id: taskDoc.id, ...taskData, tickets: taskData.tickets || [] };
                });

                setTasks(tasksData);

                let userClosedTickets = 0;
                let userTotalTickets = 0;

                tasksData.forEach(task => {
                    task.tickets.forEach(ticket => {
                        if (ticket.assignee === userData.name) {
                            userTotalTickets++;
                            if (task.title === "Close") {
                                userClosedTickets++;
                            }
                        }
                    });
                });

                console.log("close " + userClosedTickets)
                console.log("total " + userTotalTickets)
                const calculatedProgress = userTotalTickets === 0 ? 100 : Math.round((userClosedTickets / userTotalTickets) * 100);
                setProgress(calculatedProgress);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTeamMembers();
        fetchCurrentSprintTasks();
    }, [members, workspaceCode, userData.name]);

    // Organize members into rows of 4
    const columns = 4;
    const rows = [];
    for (let i = 0; i < teamMembers.length; i += columns) {
        rows.push(teamMembers.slice(i, i + columns));
    }

    // Determine color based on progress
    const progressColor = progress < 50 ? '#FF4C4C' : progress < 80 ? '#FFD700' : '#27AE60';

    return (
        <div className="userprofile-cont">
            <div className="profile-box">
                <div className="profile-header">
                    <h1>Your Profile</h1>
                </div>
                <div className="user-info">
                    <div className="section section1">
                        <div className="column">
                            <p><strong>Full Name</strong><br />{userData.name || "{user full name}"}</p>
                            <p><strong>Session Code</strong><br />{workspaceCode || "{user session code}"}</p>
                        </div>
                        <div className="column email">
                            <p><strong>Email</strong><br />{userData.email || "{user email}"}</p>
                        </div>
                    </div>
                    <div className="section section2">
                        <h2>My Team</h2>
                        <div className="team-grid">
                            {rows.length > 0 ? (
                                rows.map((row, rowIndex) => (
                                    <div className="team-row" key={rowIndex}>
                                        {row.map((member, colIndex) => (
                                            <div className="team-cell" key={colIndex}>
                                                {member.name}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p>{"{No team members}"}</p>
                            )}
                        </div>
                    </div>
                    <div className="section section3">
                        <h2>About Me</h2>
                        <textarea placeholder="Write something about yourself...">
                            {/* {userData.bio || "{user bio}"} */}
                        </textarea>
                    </div>
                    <div className="section section4">
                        <h2>Your Progress</h2>
                        <div
                            className="progress-circle"
                            style={{
                                borderColor: progressColor,
                                color: progressColor,
                            }}
                        >
                            <span>{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
