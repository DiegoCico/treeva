import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Welcome.css';
import { FaLeaf, FaTree, FaSeedling, FaUserFriends, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const Welcome = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const quotes = [
      "Nature does not hurry, yet everything is accomplished.",
      "Growth is a journey, let’s nurture it together.",
      "To walk in nature is to witness a thousand miracles.",
      "As trees grow, so do ideas and projects with time and care."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="homepage-container">
      <section className="welcome-section fade-in">
        <header className="homepage-header">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} className="homepage-logo" alt="Treeva Logo" />
          <h1>Welcome to Treeva</h1>
          <p className="homepage-quote">{quote}</p>
          <p>Treeva is where your team and projects grow, branch out, and flourish.</p>
        </header>
      </section>

      <section className="about-section">
        <h2>About Treeva</h2>
        <p>
          At Treeva, we believe that projects, like trees, thrive with care and nurturing.
          Our platform empowers teams, streamlines project management, and
          fosters growth in an environment inspired by nature’s elegance.
        </p>
        <p>
          We provide tools for every stage of your project’s lifecycle—from task management to growth tracking—
          helping teams reach new heights with intuitive features and natural progress indicators.
        </p>
      </section>

      <section className="features-section">
        <h2>Core Features</h2>
        <div className="features-grid">
          <div className="feature">
            <FaLeaf className="feature-icon" />
            <h3>Task Management</h3>
            <p>Organize tasks and projects in a way that feels natural and intuitive.</p>
          </div>
          <div className="feature">
            <FaTree className="feature-icon" />
            <h3>Team Collaboration</h3>
            <p>Connect your team and grow stronger, like branches on a tree.</p>
          </div>
          <div className="feature">
            <FaSeedling className="feature-icon" />
            <h3>Growth Tracking</h3>
            <p>Visualize your project’s progress and celebrate milestones.</p>
          </div>
          <div className="feature">
            <FaUserFriends className="feature-icon" />
            <h3>User Profiles</h3>
            <p>Personalized profiles to track progress and individual contributions.</p>
          </div>
          <div className="feature">
            <FaChartLine className="feature-icon" />
            <h3>Analytics</h3>
            <p>Get insights on your team’s productivity and project trends.</p>
          </div>
          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <h3>Data Security</h3>
            <p>Advanced security features to protect your team’s data.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Grow?</h2>
        <p>Join Treeva and start nurturing your team's projects to new heights.</p>
        <div className="cta-buttons">
          <Link to="/login" className="cta-button primary">Get Started</Link>
          <Link to="/learn-more" className="cta-button secondary">Learn More</Link>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
