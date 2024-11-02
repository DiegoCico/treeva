import React, { useState } from 'react';
import '../css/Dropdown.css';

const Dropdown = ({ options, selected, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
        {selected ? (
          <>
            <span className="user-initial-circle">{selected.name.charAt(0).toUpperCase()}</span>
            <span>{selected.name}</span>
          </>
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option.id}
              className="dropdown-option"
              onClick={() => handleSelect(option)}
            >
              <span className="user-initial-circle">{option.name.charAt(0).toUpperCase()}</span>
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
