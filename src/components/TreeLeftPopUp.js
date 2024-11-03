import React from 'react';

const TreeLeftPopUp = () => {
    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '20%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: '5px',
                fontWeight: 'bold'
            }}
        >
            Left Popup Content
        </div>
    );
};

export default TreeLeftPopUp;

