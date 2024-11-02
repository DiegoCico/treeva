import React from "react";
import '../css/HomePageHeader.css';

export default function HomePageHeader({ userName }) {
    return (
        <div className="header-cont">
            <div className="greeting">
                <h1>Hi, {userName}</h1>
            </div>
            <div className="actions">
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search..." 
                />
                <button className="notification-btn">
                    <i className="fa-regular fa-bell"></i>
                </button>
            </div>
        </div>
    )
}