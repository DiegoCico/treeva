import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Ticket from './Ticket';
import '../css/Task.css';

const TaskComponent = ({ workspaceCode, sprintId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log("Fetching tasks for sprint:", sprintId);

        const tasksRef = collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`);
        const tasksSnapshot = await getDocs(tasksRef);

        let taskData = tasksSnapshot.docs.map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data(),
          tickets: taskDoc.data().tickets || [],
        }));

        const hasToDo = taskData.some(task => task.title === "To Do");
        const hasClosed = taskData.some(task => task.title === "Closed");

        if (!hasToDo) {
          const toDoTask = await createMandatoryTask("To Do");
          taskData = [toDoTask, ...taskData];
        }

        if (!hasClosed) {
          const closedTask = await createMandatoryTask("Closed");
          taskData = [...taskData, closedTask];
        }

        setTasks(taskData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (sprintId) {
      fetchTasks();
    }
  }, [workspaceCode, sprintId]);

  const createMandatoryTask = async (title) => {
    const newTask = {
      title,
      createdAt: new Date(),
      tickets: []
    };

    try {
      const taskDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`), title);
      await setDoc(taskDocRef, newTask);
      console.log(`Mandatory task '${title}' created.`);
      return { id: taskDocRef.id, ...newTask };
    } catch (error) {
      console.error(`Error creating mandatory task '${title}':`, error);
      return { id: `${title.toLowerCase()}`, title, tickets: [] };
    }
  };

  const addTask = async () => {
    const taskTitle = prompt("Enter new task column title:");
    if (!taskTitle || taskTitle === "To Do" || taskTitle === "Closed") {
      alert("Cannot use 'To Do' or 'Closed' as task names.");
      return;
    }

    const newTask = {
      title: taskTitle,
      createdAt: new Date(),
      tickets: [],
    };

    try {
      const taskDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`));
      await setDoc(taskDocRef, newTask);
      console.log(`Task column '${taskTitle}' added to sprint ID: ${sprintId}`);

      setTasks((prevTasks) => [...prevTasks, { id: taskDocRef.id, ...newTask }]);
    } catch (error) {
      console.error("Error adding task column:", error);
    }
  };

  const addTicket = async (taskId) => {
    const task = tasks.find((task) => task.id === taskId);

    if (task && task.title !== "To Do") {
      alert("Tickets can only be added to the 'To Do' column.");
      return;
    }

    const ticketTitle = prompt("Enter ticket title:");
    const ticketDescription = prompt("Enter ticket description:");

    if (ticketTitle && ticketDescription) {
      const newTicket = {
        title: ticketTitle,
        description: ticketDescription,
        createdAt: new Date(),
      };

      try {
        const ticketDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks/${taskId}/tickets`));
        await setDoc(ticketDocRef, newTicket);
        console.log(`Ticket '${ticketTitle}' added to task ID: ${taskId}`);

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, tickets: [...task.tickets, { id: ticketDocRef.id, ...newTicket }] }
              : task
          )
        );
      } catch (error) {
        console.error("Error adding ticket:", error);
      }
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const draggableTasks = tasks.filter((task) => task.title !== "To Do" && task.title !== "Closed");
    const reorderedTasks = Array.from(draggableTasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    setTasks([
      ...tasks.filter((task) => task.title === "To Do"),
      ...reorderedTasks,
      ...tasks.filter((task) => task.title === "Closed"),
    ]);
  };

  return (
    <div className="task-container">
      <h2>Tasks</h2>
      <button onClick={addTask}>Add New Task Column</button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="tasks">
          {tasks
            .filter((task) => task.title === "To Do")
            .map((task) => (
              <div key={task.id} className="task-column">
                <h3>{task.title}</h3>
                <button onClick={() => addTicket(task.id)}>Add Ticket</button>
                {task.tickets.map((ticket) => (
                  <Ticket key={ticket.id} title={ticket.title} description={ticket.description} />
                ))}
              </div>
            ))}

          <Droppable droppableId="draggable-tasks" direction="horizontal">
            {(provided) => (
              <div
                className="tasks"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {tasks
                  .filter((task) => task.title !== "To Do" && task.title !== "Closed")
                  .map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="task-column"
                        >
                          <h3>{task.title}</h3>
                          {task.tickets.map((ticket) => (
                            <Ticket key={ticket.id} title={ticket.title} description={ticket.description} />
                          ))}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {tasks
            .filter((task) => task.title === "Closed")
            .map((task) => (
              <div key={task.id} className="task-column">
                <h3>{task.title}</h3>
                {task.tickets.map((ticket) => (
                  <Ticket key={ticket.id} title={ticket.title} description={ticket.description} />
                ))}
              </div>
            ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskComponent;
