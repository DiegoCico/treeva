import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Modal from './Modal';
import Ticket from './Ticket';
import Dropdown from './Dropdown';
import '../css/Task.css';

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

  const updateTaskOrderInFirebase = async (tasks) => {
    try {
      const updatePromises = tasks.map((task, index) => {
        const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, task.id);
        return updateDoc(taskRef, { order: index });
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating task order:", error);
    }
  };

  const deleteTaskInFirebase = async (taskId) => {
    try {
      const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

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

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (destination.droppableId === "delete-zone") {
      const taskToDelete = tasks[source.index];
      if (taskToDelete.title !== "To Do" && taskToDelete.title !== "Closed") {
        setTasks(tasks.filter((task) => task.id !== taskToDelete.id));
        deleteTaskInFirebase(taskToDelete.id);
      }
      return;
    }

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    setTasks(reorderedTasks);
    updateTaskOrderInFirebase(reorderedTasks);
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
    e.target.style.color = value === "Easy" ? "green" : value === "Medium" ? "#C1C1C1" : "black";
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    const task = tasks.find((task) => task.id === selectedTaskId);

    if (!task || task.title !== "To Do") {
      alert("Tickets can only be added to the 'To Do' column.");
      return;
    }

    const newTicket = {
      ...ticketData,
      assignee: ticketData.assignee ? ticketData.assignee.name : '',
      assigner: ticketData.assigner ? ticketData.assigner.name : '',
      createdAt: new Date(),
    };

    try {
      const ticketDocRef = doc(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks/${selectedTaskId}/tickets`));
      await setDoc(ticketDocRef, newTicket);

      // Update task's tickets in Firestore
      const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, selectedTaskId);
      const updatedTickets = [...task.tickets, { id: ticketDocRef.id, ...newTicket }];
      await updateDoc(taskRef, { tickets: updatedTickets });

      // Update the state with the new ticket
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTaskId
            ? { ...task, tickets: updatedTickets }
            : task
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  return (
    <div className="task-container">
      <h2>Tasks</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              className="tasks"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="task-column"
                    >
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        {task.title === "To Do" && <button onClick={() => openModal(task.id)}>Add Ticket</button>}
                      </div>
                      {task.tickets.map((ticket, ticketIndex) => (
                        <Draggable key={ticket.id} draggableId={ticket.id} index={ticketIndex}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="ticket"
                            >
                              <Ticket
                                title={ticket.title}
                                description={ticket.description}
                                category={ticket.category}
                                assignee={ticket.assignee}
                                assigner={ticket.assigner}
                                difficulty={ticket.difficulty}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Create Task Box */}
              <div className="create-task-box" onClick={createNewColumn}>
                + Create Task
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
    </div>
  );
};

export default TaskComponent;
