import React from 'react';
import '../css/Modal.css';

const Modal = ({ isOpen, onClose, children, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        {children}
        {onDelete && (
          <button type="button" onClick={onDelete} className="delete-button">
            Delete Ticket
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
