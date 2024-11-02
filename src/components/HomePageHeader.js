import React from "react";
import '../css/HomePageHeader.css';

export default function HomePageHeader({ message }) {
    return (
        <div className="header-cont">
            <div className="greeting">
                <h1>{message}</h1>
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