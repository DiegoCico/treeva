import React, {useState} from 'react';
import '../css/SideNav.css';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function SideNav({ activeButton, setActiveButton }) {
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('User logged out');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <>
            <div className='logo-cont'>
                {/* <img src='/sidenav-logo.png' alt='logo' className='sidenav-logo'/> */}
                <div className='logo-placeholder'>
                    <span>Logo Placeholder</span>
                </div>
            </div>
            <div className='btns-cont'>
                <button 
                    className={`icon-button ${activeButton === 'user' ? 'active' : ''}`} 
                    onClick={() => setActiveButton('user')}
                >
                    <i className="fa-solid fa-user"></i>
                </button>
                <button 
                    className={`icon-button ${activeButton === 'sprints' ? 'active' : ''}`} 
                    onClick={() => setActiveButton('sprints')}
                >
                    <i className="fa-regular fa-calendar"></i>
                </button>
                <button 
                    className={`icon-button ${activeButton === 'logout' ? 'active' : ''}`} 
                    onClick={handleLogout}
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </>
    )
}