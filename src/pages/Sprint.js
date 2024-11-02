import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import '../css/Sprint.css';

const Sprint = () => {
  const { userId, workspaceCode } = useParams(); 
  const [sprint, setSprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintDuration, setNewSprintDuration] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the most recent sprint when workspaceCode is available
  useEffect(() => {
    const fetchMostRecentSprint = async () => {
      try {
        const sprintRef = collection(db, `${workspaceCode}/sprints`);
        const sprintQuery = query(sprintRef, orderBy('createdAt', 'desc'), limit(1));
        const sprintSnapshot = await getDocs(sprintQuery);

        if (sprintSnapshot.empty) {
          setShowModal(true); // Show modal if no sprints exist
        } else {
          sprintSnapshot.forEach((doc) => {
            const sprintData = { id: doc.id, ...doc.data() };
            setSprint(sprintData);
            const remainingTime = calculateRemainingTime(sprintData.duration);
            setCountdown(remainingTime);
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

  useEffect(() => {
    if (countdown === 0) {
      setShowModal(true); // Show modal when countdown reaches zero
    }

    if (countdown > 0) {
      const intervalId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000); // Decrement every second

      return () => clearInterval(intervalId);
    }
  }, [countdown]);

  const handleCreateSprint = async () => {
    if (!newSprintName) {
      setError("Sprint name is required.");
      return;
    }

    try {
      const sprintDocRef = doc(db, `${workspaceCode}/sprints`, newSprintName);
      const newSprint = {
        name: newSprintName,
        duration: newSprintDuration,
        hasEnded: false,
        createdAt: new Date(),
      };
      await setDoc(sprintDocRef, newSprint);
      setSprint({ id: newSprintName, ...newSprint });
      const remainingTime = calculateRemainingTime(newSprintDuration);
      setCountdown(remainingTime); // Reset countdown for new sprint
      setShowModal(false);
      setError(''); // Clear error on successful creation
    } catch (error) {
      console.error("Error creating sprint:", error);
      setError("Error creating sprint. Please try again.");
    }
  };

  const handleEndSprint = async () => {
    try {
      const sprintDoc = doc(db, `${workspaceCode}/sprints`, sprint.id);
      await updateDoc(sprintDoc, { hasEnded: true });
      setSprint((prev) => ({ ...prev, hasEnded: true }));
    } catch (error) {
      console.error("Error ending sprint:", error);
      setError("Error ending sprint. Please try again.");
    }
  };

  const calculateRemainingTime = (duration) => {
    const [number, unit] = duration.split(' ');
    const timeMultiplier = {
      days: 86400, 
      hours: 3600, 
      minutes: 60, 
    };
    return number * (timeMultiplier[unit] || 0);
  };

  const formatCountdown = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
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
        <input
          type="text"
          placeholder="Duration (e.g., 7 days)"
          value={newSprintDuration}
          onChange={(e) => setNewSprintDuration(e.target.value)}
        />
        <button onClick={handleCreateSprint}>Create Sprint</button>
      </div>
    );
  }

  return (
    <div className="sprint-page">
      {sprint ? (
        <>
          <div className="sprint-header">
            <h1>{sprint.name}</h1>
            <p>{formatCountdown(countdown)} remaining</p>
            <button className="end-sprint-btn" onClick={handleEndSprint} disabled={sprint.hasEnded}>
              {sprint.hasEnded ? 'Sprint Ended' : 'End Sprint'}
            </button>
          </div>
        </>
      ) : (
        <p>No active sprint found.</p>
      )}
    </div>
  );
};

export default Sprint;
