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
  const [showAnalytics, setShowAnalytics] = useState(false); // New state for toggling Analytics view

  console.log("Workspace Code:", workspaceCode);
  console.log("User ID:", userId);

  useEffect(() => {
    const fetchMostRecentSprint = async () => {
      try {
        console.log("Fetching the most recent sprint...");

        const sprintRef = collection(db, `workspace/${workspaceCode}/sprints`);
        const sprintQuery = query(sprintRef, orderBy('createdAt', 'desc'), limit(1));
        
        const sprintSnapshot = await getDocs(sprintQuery);
        console.log("Sprint Snapshot Size:", sprintSnapshot.size);
        
        if (sprintSnapshot.empty) {
          console.log("No sprints found. Showing modal for creating a new sprint.");
          setShowModal(true);
        } else {
          sprintSnapshot.forEach((doc) => {
            const sprintData = { id: doc.id, ...doc.data() };
            console.log("Fetched Sprint Data:", sprintData);
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
    console.log("Creating a new sprint...");

    if (!newSprintName) {
      setError("Sprint name is required.");
      console.log("Error: Sprint name is required.");
      return;
    }

    try {
      const sprintDocRef = doc(db, `workspace/${workspaceCode}/sprints`, newSprintName);
      const newSprint = {
        name: newSprintName,
        hasEnded: false,
        createdAt: new Date(),
      };

      console.log("New Sprint Data:", newSprint);

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
    console.log("Ending the sprint...");

    try {
      const sprintDoc = doc(db, `workspace/${workspaceCode}/sprints`, sprint.id);
      await updateDoc(sprintDoc, { hasEnded: true });
      console.log("Sprint marked as ended.");
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
    <div className="sprint-page">
      {sprint ? (
        <>
          <div className="sprint-header">
            <h1>{sprint.name}</h1>
            <button className="end-sprint-btn" onClick={handleEndSprint} disabled={sprint.hasEnded}>
              {sprint.hasEnded ? 'Sprint Ended' : 'End Sprint'}
            </button>
            <button className="analytics-btn" onClick={() => setShowAnalytics(!showAnalytics)}>
              {showAnalytics ? 'Back to Tasks' : 'Analytics'}
            </button>
          </div>
          {showAnalytics ? (
            <Analytics workspaceCode={workspaceCode} sprintId={sprint.id} />
          ) : (
            <TaskComponent workspaceCode={workspaceCode} sprintId={sprint.id} />
          )}
        </>
      ) : (
        <p>No active sprint found.</p>
      )}
    </div>
  );
};

export default Sprint;
