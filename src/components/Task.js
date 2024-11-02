import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Modal from './Modal';
import Ticket from './Ticket';
import Dropdown from './Dropdown';
import '../css/Task.css';

const ItemTypes = {
  TICKET: 'TICKET',
};

const TaskComponent = ({ workspaceCode, sprintId, currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    category: '',
    assignee: null,
    assigner: null,
    difficulty: '',
  });

  // Fetch tasks and users data from Firebase
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
        taskData.sort((a, b) => a.order - b.order);
        setTasks(taskData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const workspaceDocRef = doc(db, `workspace/${workspaceCode}`);
        const workspaceDoc = await getDoc(workspaceDocRef);
        if (workspaceDoc.exists()) {
          const members = workspaceDoc.data().members || [];
          const usersPromises = members.map(async (userId) => {
            const userDoc = await getDoc(doc(db, `users`, userId));
            return userDoc.exists() ? { id: userId, name: userDoc.data().name } : null;
          });
          const users = (await Promise.all(usersPromises)).filter(Boolean);
          setWorkspaceUsers(users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchTasks();
    fetchUsers();
  }, [workspaceCode, sprintId]);

  const createNewColumn = async () => {
    const newTask = {
      title: `New Column ${tasks.length + 1}`,
      createdAt: new Date(),
      tickets: [],
      order: tasks.length,
    };
  
    try {
      const newTaskRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`));
      await setDoc(newTaskRef, newTask);
      setTasks((prevTasks) => [...prevTasks, { id: newTaskRef.id, ...newTask }]);
    } catch (error) {
      console.error("Error creating new column:", error);
    }
  };

  const updateTaskTicketsInFirebase = async (taskId, tickets) => {
    try {
      const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, taskId);
      await updateDoc(taskRef, { tickets });
    } catch (error) {
      console.error("Error updating task tickets:", error);
    }
  };

  const TaskColumn = ({ task }) => {
    const [, ref] = useDrop({
      accept: ItemTypes.TICKET,
      drop: (item) => handleDrop(item, task.id),
    });

    return (
      <div ref={ref} className="task-column">
        <div className="task-header">
          <h3>{task.title}</h3>
          {task.title === "To Do" && <button onClick={() => openModal(task.id)}>Add Ticket</button>}
        </div>
        <div className="ticket-list">
          {task.tickets.map((ticket, index) => (
            <TicketItem key={ticket.id} ticket={ticket} taskId={task.id} index={index} />
          ))}
        </div>
      </div>
    );
  };

  const TicketItem = ({ ticket, taskId }) => {
    const [{ isDragging }, dragRef] = useDrag({
      type: ItemTypes.TICKET,
      item: { id: ticket.id, taskId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div ref={dragRef} className="ticket" style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Ticket {...ticket} />
      </div>
    );
  };

  const handleDrop = async (item, destinationTaskId) => {
    const { id: ticketId, taskId: sourceTaskId } = item;
    if (sourceTaskId === destinationTaskId) return;

    const sourceTask = tasks.find((task) => task.id === sourceTaskId);
    const destinationTask = tasks.find((task) => task.id === destinationTaskId);
    const movedTicket = sourceTask.tickets.find((ticket) => ticket.id === ticketId);

    // Remove ticket from source task and add to destination task
    const updatedSourceTickets = sourceTask.tickets.filter((ticket) => ticket.id !== ticketId);
    const updatedDestinationTickets = [...destinationTask.tickets, movedTicket];

    // Update state
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === sourceTaskId) {
          return { ...task, tickets: updatedSourceTickets };
        } else if (task.id === destinationTaskId) {
          return { ...task, tickets: updatedDestinationTickets };
        } else {
          return task;
        }
      })
    );

    // Update Firebase
    await updateTaskTicketsInFirebase(sourceTaskId, updatedSourceTickets);
    await updateTaskTicketsInFirebase(destinationTaskId, updatedDestinationTickets);
  };

  // Modal handlers
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
      assignee: null,
      assigner: null,
      difficulty: '',
    });
  };

  const handleTicketInput = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (e) => {
    const { value } = e.target;
    setTicketData((prev) => ({ ...prev, difficulty: value }));
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    const task = tasks.find((task) => task.id === selectedTaskId);

    const newTicket = {
      id: Date.now().toString(), // Unique ID for the ticket
      ...ticketData,
      assignee: ticketData.assignee ? ticketData.assignee.name : '',
      assigner: ticketData.assigner ? ticketData.assigner.name : '',
      createdAt: new Date(),
    };

    try {
      // Add the new ticket directly to the task's tickets array in Firebase
      const updatedTickets = [...task.tickets, newTicket];
      await updateTaskTicketsInFirebase(selectedTaskId, updatedTickets);

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTaskId ? { ...task, tickets: updatedTickets } : task
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="task-container">
        <h2>Tasks</h2>
        <div className="tasks">
          {tasks.map((task) => (
            <TaskColumn key={task.id} task={task} />
          ))}
        </div>
        <div className="create-task-box" onClick={createNewColumn}>+ Create Task</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Add New Ticket</h2>
        <form onSubmit={submitTicket}>
          <input type="text" name="title" placeholder="Title" onChange={handleTicketInput} value={ticketData.title} required />
          <textarea name="description" placeholder="Description" onChange={handleTicketInput} value={ticketData.description} required></textarea>
          <input type="text" name="category" placeholder="Category" onChange={handleTicketInput} value={ticketData.category} />
          <label>Assignee</label>
          <Dropdown
            options={workspaceUsers}
            selected={ticketData.assignee}
            onSelect={(user) => setTicketData(prev => ({ ...prev, assignee: user }))}
            placeholder="Select Assignee"
          />
          <label>Assigner</label>
          <Dropdown
            options={workspaceUsers}
            selected={ticketData.assigner}
            onSelect={(user) => setTicketData(prev => ({ ...prev, assigner: user }))}
            placeholder="Select Assigner"
          />
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
    </DndProvider>
  );
};

export default TaskComponent;
