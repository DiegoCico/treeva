import React from 'react';


const Ticket = ({ title, description, category, assignee, assigner, difficulty }) => {
  return (
    <div className="ticket">
      <h3>{title}</h3>
      <p>{description}</p>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>Assignee:</strong> {assignee}</p>
      <p><strong>Assigner:</strong> {assigner}</p>
      <p><strong>Difficulty:</strong> {difficulty}</p>
    </div>
  );
};

export default Ticket;
