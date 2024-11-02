import React from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import '../css/Homepage.css';

export default function Homepage() {
    const { userId, workspaceCode } = useParams()
    console.log(userId, workspaceCode)
    return (
        <div className="homepage">
            <div className='sidenav'>
                <SideNav />
            </div>
            <div className='body'>

            </div>
        </div>
    )
}