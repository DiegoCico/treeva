import React from "react";
import '../css/UserProfile.css';

export default function UserProfile({ userData }) {
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
                            <p><strong>Session Code</strong><br />{userData.workspaceCode || "{user session code}"}</p>
                        </div>
                        <div className="column email">
                            <p><strong>Email</strong><br />{userData.email || "{user email}"}</p>
                        </div>
                    </div>
                    <div className="section section2">
                        <h2>My Team</h2>
                        {/* <p>{userData.team?.[0] || "{user}"}</p>
                        <p>{userData.team?.[1] || "{user}"}</p>
                        <p>{userData.team?.[2] || "{user}"}</p> */}
                    </div>
                    <div className="section section3">
                        <h2>About Me</h2>
                        <textarea placeholder="Write something about yourself...">
                            {/* {userData.bio || "{user bio}"} */}
                        </textarea>
                    </div>
                    <div className="section section4">
                        <h2>Your Progress</h2>
                        <div className="progress-circle">
                            <span>50%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
