import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Modal from './Modal';
import Ticket from './Ticket';
import '../css/Task.css';

const TaskComponent = ({ workspaceCode, sprintId }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    category: '',
    assignee: '',
    assigner: '',
    difficulty: '',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksRef = collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`);
        const tasksSnapshot = await getDocs(tasksRef);

        let taskData = tasksSnapshot.docs.map((taskDoc) => ({
          id: taskDoc.id,
          ...taskDoc.data(),
          tickets: taskDoc.data().tickets || [],
        }));

        // Ensure 'To Do' and 'Closed' columns exist
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

        setTasks([
          ...taskData.filter(task => task.title === "To Do"),
          ...taskData.filter(task => task.title !== "To Do" && task.title !== "Closed"),
          ...taskData.filter(task => task.title === "Closed"),
        ]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (sprintId) {
      fetchTasks();
    }
  }, [workspaceCode, sprintId]);

  const createMandatoryTask = async (title) => {
    const newTask = { title, createdAt: new Date(), tickets: [] };
    try {
      const taskDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`), title);
      await setDoc(taskDocRef, newTask);
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

    const newTask = { title: taskTitle, createdAt: new Date(), tickets: [] };
    try {
      const taskDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`));
      await setDoc(taskDocRef, newTask);
      setTasks((prevTasks) => [
        ...prevTasks.filter(task => task.title === "To Do"),
        ...prevTasks.filter(task => task.title !== "To Do" && task.title !== "Closed"),
        { id: taskDocRef.id, ...newTask },
        ...prevTasks.filter(task => task.title === "Closed"),
      ]);
    } catch (error) {
      console.error("Error adding task column:", error);
    }
  };

  const openModal = (taskId) => {
    setSelectedTaskId(taskId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTicketData({
      title: '',
      description: '',
      category: '',
      assignee: '',
      assigner: '',
      difficulty: '',
    });
  };

  const handleTicketInput = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic styling for the dropdown based on selected difficulty
  const handleDifficultyChange = (e) => {
    const { value } = e.target;
    setTicketData((prev) => ({ ...prev, difficulty: value }));
    e.target.style.color = value === "Easy" ? "green" : value === "Medium" ? "#C1C1C1" : "black";
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    const task = tasks.find((task) => task.id === selectedTaskId);

    if (task && task.title !== "To Do") {
      alert("Tickets can only be added to the 'To Do' column.");
      return;
    }

    const newTicket = {
      ...ticketData,
      createdAt: new Date(),
    };

    try {
      const ticketDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks/${selectedTaskId}/tickets`));
      await setDoc(ticketDocRef, newTicket);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTaskId
            ? { ...task, tickets: [...task.tickets, { id: ticketDocRef.id, ...newTicket }] }
            : task
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error adding ticket:", error);
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
          {tasks.map((task) => (
            <div key={task.id} className="task-column">
              <h3>{task.title}</h3>
              {task.title === "To Do" && <button onClick={() => openModal(task.id)}>Add Ticket</button>}
              {task.tickets.map((ticket) => (
                <Ticket
                  key={ticket.id}
                  title={ticket.title}
                  description={ticket.description}
                  category={ticket.category}
                  assignee={ticket.assignee}
                  assigner={ticket.assigner}
                  difficulty={ticket.difficulty}
                />
              ))}
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Add New Ticket</h2>
        <form onSubmit={submitTicket}>
          <input type="text" name="title" placeholder="Title" onChange={handleTicketInput} value={ticketData.title} required />
          <textarea name="description" placeholder="Description" onChange={handleTicketInput} value={ticketData.description} required></textarea>
          <input type="text" name="category" placeholder="Category" onChange={handleTicketInput} value={ticketData.category} />
          <input type="text" name="assignee" placeholder="Assignee" onChange={handleTicketInput} value={ticketData.assignee} />
          <input type="text" name="assigner" placeholder="Assigner" onChange={handleTicketInput} value={ticketData.assigner} />

          {/* Difficulty Dropdown with Dynamic Color */}
          <select
            name="difficulty"
            onChange={handleDifficultyChange}
            value={ticketData.difficulty}
            required
            className="difficulty-select"
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button type="submit">Submit Ticket</button>
        </form>
      </Modal>
    </div>
  );
};

export default TaskComponent;
