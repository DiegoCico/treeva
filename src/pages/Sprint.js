import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import '../css/Sprint.css';
import TaskComponent from '../components/Task';
import Analytics from './Analytics';

const Sprint = () => {
  const { userId, workspaceCode } = useParams();
  const [sprint, setSprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

  // Check for saved theme preference on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.body.classList.toggle('dark-mode', savedTheme === 'dark');
      document.body.classList.toggle('light-mode', savedTheme !== 'dark');
    }
  }, []);

  // Toggle dark mode and save preference to localStorage
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', newMode);
      document.body.classList.toggle('light-mode', !newMode);
      return newMode;
    });
  };

  useEffect(() => {
    const fetchMostRecentSprint = async () => {
      try {
        const sprintRef = collection(db, `workspace/${workspaceCode}/sprints`);
        const sprintQuery = query(sprintRef, orderBy('createdAt', 'desc'), limit(1));

        const sprintSnapshot = await getDocs(sprintQuery);

        if (sprintSnapshot.empty) {
          setShowModal(true);
        } else {
          sprintSnapshot.forEach((doc) => {
            const sprintData = { id: doc.id, ...doc.data() };
            setSprint(sprintData);
          });
        }
      } catch (error) {
        console.error("Error fetching sprints:", error);
        setError("Error fetching sprints. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (workspaceCode) {
      fetchMostRecentSprint();
    }
  }, [workspaceCode]);

  const handleCreateSprint = async () => {
    if (!newSprintName) {
      setError("Sprint name is required.");
      return;
    }

    try {
      const sprintDocRef = doc(db, `workspace/${workspaceCode}/sprints`, newSprintName);
      const newSprint = {
        name: newSprintName,
        hasEnded: false,
        createdAt: new Date(),
      };

      await setDoc(sprintDocRef, newSprint);
      setSprint({ id: newSprintName, ...newSprint });
      setShowModal(false);
      setError(''); // Clear error on successful creation
    } catch (error) {
      console.error("Error creating sprint:", error);
      setError("Error creating sprint. Please try again.");
    }
  };

  const handleEndSprint = async () => {
    try {
      const sprintDoc = doc(db, `workspace/${workspaceCode}/sprints`, sprint.id);
      await updateDoc(sprintDoc, { hasEnded: true });
      setSprint((prev) => ({ ...prev, hasEnded: true }));
      setShowModal(true);
    } catch (error) {
      console.error("Error ending sprint:", error);
      setError("Error ending sprint. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!workspaceCode) return <p>Workspace code is required to load sprints.</p>;

  if (showModal) {
    return (
      <div className="modal">
        <h2>Create New Sprint</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Sprint Name"
          value={newSprintName}
          onChange={(e) => setNewSprintName(e.target.value)}
        />
        <button onClick={handleCreateSprint}>Create Sprint</button>
      </div>
    );
  }

  return (
    <div className={`sprint-page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sprint-header">
        <h1>{sprint?.name || 'Sprint'}</h1>
        <button className="end-sprint-btn" onClick={handleEndSprint} disabled={sprint?.hasEnded}>
          {sprint?.hasEnded ? 'Sprint Ended' : 'End Sprint'}
        </button>
        <button className="analytics-btn" onClick={() => setShowAnalytics(!showAnalytics)}>
          {showAnalytics ? 'Back to Tasks' : 'Analytics'}
        </button>
    
      </div>
      {showAnalytics ? (
        <Analytics workspaceCode={workspaceCode} sprintId={sprint?.id} />
      ) : (
        <TaskComponent workspaceCode={workspaceCode} sprintId={sprint?.id} />
      )}
    </div>
  );
};

export default Sprint;
