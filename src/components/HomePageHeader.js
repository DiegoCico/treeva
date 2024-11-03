import React, { useState } from "react";
import '../css/HomePageHeader.css';

export default function HomePageHeader({ message }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
        document.body.classList.toggle('dark-mode', !isDarkMode);
        document.body.classList.toggle('light-mode', isDarkMode);
    };

    return (
        <div className="header-cont">
            <div className="greeting">
                <h1>{message}</h1>
            </div>
            <div className="actions">
                <button className="notification-btn">
                    <i className="fa-solid fa-bell"></i>
                </button>
                <input className="search-bar" type="text" placeholder="Search..." />
                <button 
                    className={`theme-toggle-button ${isDarkMode ? 'dark' : 'light'}`} 
                    onClick={toggleTheme}
                >
                    {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
            </div>
        </div>
    );
}
