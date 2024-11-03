import React from 'react';
import '../css/SideNav.css';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function SideNav({ activeButton, setActiveButton }) {
    const auth = getAuth();
    const navigate = useNavigate();

    // Define buttons with unique identifiers
    const buttons = ['user', 'sprints', 'trees', 'logout'];
    const activeIndex = buttons.indexOf(activeButton); // Determine active button index

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
        <div className='sidenav-container'>
            <div className='logo-cont'>
                <div className='logo-placeholder'>
                    <span>Logo</span>
                </div>
            </div>
            <div className='btns-cont'>
                {/* Moving vertical line indicator */}
                <div 
                    className="active-indicator" 
                    style={{ top: `${activeIndex * 125}px` }} /* 100px button height + 20px margin */
                />

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
                    className={`icon-button ${activeButton === 'trees' ? 'active' : ''}`} 
                    onClick={() => setActiveButton('trees')}
                >
                    <i className="fa-solid fa-seedling"></i>
                </button>
            </div>
            <div className='logout-btn-cont'>
                <button 
                    className={`icon-button logout-button ${activeButton === 'logout' ? 'active' : ''}`} 
                    onClick={() => {
                        setActiveButton('logout');
                        handleLogout();
                    }}
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </div>
    );
}
