// Ticket.js
import React from 'react';
// import './Ticket.css';

const Ticket = ({ title, description }) => {
  return (
    <div className="ticket">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Ticket;
