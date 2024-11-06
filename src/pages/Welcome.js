import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.svg';
import '../css/Welcome.css';
import { FaLeaf, FaTree, FaWater } from 'react-icons/fa';

const Welcome = () => {
  const [quote, setQuote] = useState('');

  // Fetch a nature-themed quote or motivational quote
  useEffect(() => {
    const quotes = [
      "Nature does not hurry, yet everything is accomplished.",
      "In nature, nothing is perfect, and everything is perfect.",
      "To walk in nature is to witness a thousand miracles.",
      "Nature is not a place to visit. It is home.",
      "Look deep into nature, and you will understand everything better."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <img src={logo} className="homepage-logo" alt="logo" />
        <h1>Welcome to Treeva</h1>
        <p className="homepage-quote">"{quote}"</p>
      </header>

      <div className="nature-elements">
        <FaLeaf className="nature-icon leaf-icon" />
        <FaTree className="nature-icon tree-icon" />
        <FaWater className="nature-icon water-icon" />
      </div>

      <div className="cta-buttons">
        <Link to="/login" className="cta-button">Get Started</Link>
        <Link to="/learn-more" className="cta-button cta-secondary">Learn More</Link>
      </div>
    </div>
  );
};

export default Welcome;
