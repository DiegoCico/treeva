import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Welcome.css';
import { FaLeaf, FaTree, FaSeedling } from 'react-icons/fa';

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
          <h1 className="slide-in">Welcome to Treeva</h1>
          <p className="homepage-quote">{quote}</p>
          <p>Treeva is where your team and projects grow, branch out, and flourish.</p>
        </header>
      </section>

      <section className="about-section slide-up">
        <h2>About Treeva</h2>
        <p>
          At Treeva, we believe that projects, like trees, thrive with care and nurturing.
          Our platform is designed to empower teams, streamline project management, and
          foster growth in an environment inspired by nature’s elegance.
        </p>
      </section>

      <section className="productivity-section fade-in">
        <h2>Grow Together with Treeva</h2>
        <p>Teams using Treeva have reported:</p>
        <ul>
          <li><strong>30%</strong> improvement in productivity</li>
          <li><strong>20%</strong> increase in team collaboration</li>
          <li><strong>85%</strong> success in project completion</li>
        </ul>
        <p>Treeva helps you cultivate ideas, nourish projects, and track your growth.</p>
      </section>

      <section className="features-section zoom-in">
        <h2>Our Core Features</h2>
        <div className="features-grid">
          <div className="feature scale-up">
            <FaLeaf className="feature-icon bounce" />
            <h3>Task Management</h3>
            <p>Organize tasks and projects in a way that feels natural and intuitive.</p>
          </div>
          <div className="feature scale-up">
            <FaTree className="feature-icon bounce" />
            <h3>Team Collaboration</h3>
            <p>Bring your team together and grow stronger, like branches on a tree.</p>
          </div>
          <div className="feature scale-up">
            <FaSeedling className="feature-icon bounce" />
            <h3>Growth Tracking</h3>
            <p>Visualize your project’s progress and celebrate milestones along the way.</p>
          </div>
        </div>
      </section>

      <section className="cta-section slide-up">
        <h2>Ready to Grow?</h2>
        <p>Join Treeva and start nurturing your team's projects to new heights.</p>
        <div className="cta-buttons">
          <Link to="/login" className="cta-button pulse">Get Started</Link>
          <Link to="/learn-more" className="cta-button cta-secondary pulse">Learn More</Link>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
