import React, {useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import '../css/Homepage.css';
import HomePageHeader from '../components/HomePageHeader';
import Sprint from './Sprint';
import UserProfile from '../components/UserProfile';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Homepage() {
    const { userId, workspaceCode } = useParams()
    const [activeButton, setActiveButton] = useState('user')
    const [userData, setUserData] = useState({})

    const getUserData = async(userId) => {
        try {
            const userDocRef = doc(db, "users", userId)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
                setUserData(userDoc.data())
            } else {
                console.log('No user found')
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (userId) {
            getUserData(userId)
        }
    }, [userId])

    useEffect(() => {
        if (userData) {
            console.log(userData)
        }
    }, [userData])

    return (
        <div className="homepage">
            <div className='sidenav'>
                <SideNav activeButton={activeButton} setActiveButton={setActiveButton} />
            </div>
            <div className='body'>
                <HomePageHeader userName={userData.name}/>
                <div className='main'>
                    {activeButton === 'user' && <UserProfile userData={userData}/>}
                    {activeButton === 'sprints' && <Sprint />}
                </div>
            </div>
        </div>
    )
}