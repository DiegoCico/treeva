import React from 'react';

const TreeLeftPopUp = ({ currentSprint }) => {
    console.log(currentSprint)
    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '40%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: '5px',
                fontWeight: 'bold'
            }}
        >
            <div className="analytics-item-right">
              <p>Total Tickets: {currentSprint.totalTickets}</p>
              <p>Closed Tickets: {currentSprint.closedTickets}</p>
              <p>Progress %: {currentSprint.closePercentage}%</p>
            </div>
        </div>
    );
};

export default TreeLeftPopUp;

