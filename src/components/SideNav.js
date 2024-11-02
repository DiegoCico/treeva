import React, {useState} from 'react';
import '../css/SideNav.css';

export default function SideNav() {
    const [activeButton, setActiveButton] = useState('user');

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
                    onClick={() => setActiveButton('logout')}
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </>
    )
}