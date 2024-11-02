import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import '../css/Homepage.css';
import HomePageHeader from '../components/HomePageHeader';
import Sprint from './Sprint';
import UserProfile from '../components/UserProfile';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import IslandScene from '../components/IslandScene';

export default function Homepage() {
    const { userId, workspaceCode } = useParams();
    const [activeButton, setActiveButton] = useState('user');
    const [userData, setUserData] = useState({});
    const [workspace, setWorkspace] = useState({});

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
            const workspaceDocRef = doc(db, "workspace", workspaceCode);
            const workspaceDoc = await getDoc(workspaceDocRef);

            console.log(workspaceDoc)

            if (workspaceDoc.exists()) {
                setWorkspace(workspaceDoc.data());
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
                    <HomePageHeader message={'Your Sprints'} />
                )}
                {activeButton === 'trees' && (
                    <HomePageHeader message={'Visual Progress'} />
                )}
                <div className="main">
                    {activeButton === 'user' && (
                        <UserProfile userData={userData} workspace={workspace} workspaceCode={workspaceCode} />
                    )}
                    {activeButton === 'sprints' && <Sprint />}
                    {activeButton === 'trees' && <IslandScene />}
                </div>
            </div>
        </div>
    );
}
