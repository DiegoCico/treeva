import React, { useState, useEffect } from 'react';
import './Task.css';

const TaskComponent = () => {
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    // Create default sprint if none exist
    if (sprints.length === 0) {
      setSprints([{ name: 'Sprint', tasks: [] }]);
    }
  }, [sprints]);

  // Add a new task to a sprint, creating the sprint if it doesn't exist
  const addTaskToSprint = (sprintName, task) => {
    setSprints((prevSprints) => {
      const sprintIndex = prevSprints.findIndex((sprint) => sprint.name === sprintName);

      if (sprintIndex !== -1) {
        const updatedSprints = [...prevSprints];
        updatedSprints[sprintIndex].tasks.push(task);
        return updatedSprints;
      }

      return [...prevSprints, { name: sprintName, tasks: [task] }];
    });
  };

  // Function to simulate adding a new task to the default sprint
  const handleAddTask = () => {
    const newTask = { title: `Task ${sprints[0].tasks.length + 1}`, description: 'Task description' };
    addTaskToSprint('Sprint', newTask);
  };

  return (
    <div className="task-container">
      <h1>Tasks by Sprint</h1>
      <div className="sprints">
        {sprints.map((sprint, index) => (
          <div key={index} className="sprint">
            <h2>{sprint.name}</h2>
            {sprint.tasks.length > 0 ? (
              sprint.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="task">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
              ))
            ) : (
              <p className="no-tasks">No tasks in this sprint</p>
            )}
          </div>
        ))}
      </div>
      <button className="add-task-btn" onClick={handleAddTask}>Add Task to Default Sprint</button>
    </div>
  );
};

export default TaskComponent;
