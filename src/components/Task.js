import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Modal from './Modal';
import Ticket from './Ticket';
import Dropdown from './Dropdown';
import '../css/Task.css';

const ItemTypes = {
  TICKET: 'TICKET',
  COLUMN: 'COLUMN',
};

const REQUIRED_COLUMNS = ["To Do", "Close"];

const TaskComponent = ({ workspaceCode, sprintId, currentUser }) => {
  const [isEditMode, setEditMode] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
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
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

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

        const existingIds = taskData.map(task => task.id);
        const missingColumns = REQUIRED_COLUMNS.filter(id => !existingIds.includes(id));

        if (missingColumns.length > 0) {
          for (let columnId of missingColumns) {
            const newColumn = await createRequiredColumn(columnId, taskData.length);
            taskData.push(newColumn);
          }
          taskData.sort((a, b) => a.order - b.order);
        }

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

  const createRequiredColumn = async (id, order) => {
    const newTask = {
      title: id,
      createdAt: new Date(),
      tickets: [],
      order,
    };

    try {
      const newTaskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, id);
      await setDoc(newTaskRef, newTask);
      return { id: newTaskRef.id, ...newTask };
    } catch (error) {
      console.error(`Error creating column "${id}":`, error);
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

  const updateTaskOrderInFirebase = async (updatedTasks) => {
    const batch = writeBatch(db);
    updatedTasks.forEach((task, index) => {
      const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, task.id);
      batch.update(taskRef, { order: index });
    });
    await batch.commit();
  };

  const moveColumn = (dragIndex, hoverIndex) => {
    const dragTask = tasks[dragIndex];

    if (REQUIRED_COLUMNS.includes(dragTask.id)) {
      return;
    }

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, movedTask);

    updatedTasks.forEach((task, index) => (task.order = index));
    setTasks(updatedTasks);
    updateTaskOrderInFirebase(updatedTasks);
  };

  const TaskColumn = ({ task, index }) => {
    const [, dropRef] = useDrop({
      accept: [ItemTypes.COLUMN, ItemTypes.TICKET],
      hover: (item) => {
        if (item.type === ItemTypes.COLUMN && item.index !== index) {
          moveColumn(item.index, index);
          item.index = index;
        }
      },
      drop: (item) => {
        if (item.type === ItemTypes.TICKET && item.taskId !== task.id) {
          moveTicket(item.taskId, task.id, item.ticketId);
        }
      },
    });

    const [{ isDragging }, dragRef] = useDrag({
      type: ItemTypes.COLUMN,
      item: { id: task.id, index, type: ItemTypes.COLUMN },
      canDrag: !REQUIRED_COLUMNS.includes(task.id),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const handleDoubleClick = () => {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.title);
    };

    const handleTitleChange = (e) => {
      setNewTaskTitle(e.target.value);
    };

    const handleTitleBlur = async () => {
      if (newTaskTitle !== task.title) {
        try {
          const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, task.id);
          await updateDoc(taskRef, { title: newTaskTitle });

          setTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === task.id ? { ...t, title: newTaskTitle } : t))
          );
        } catch (error) {
          console.error("Error renaming task column:", error);
        }
      }
      setEditingTaskId(null);
    };

    return (
      <div ref={(node) => dragRef(dropRef(node))} className="task-column" style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="task-header">
          {editingTaskId === task.id ? (
            <input
              type="text"
              value={newTaskTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
              className="task-title-input"
            />
          ) : (
            <h3 onDoubleClick={handleDoubleClick}>{task.title}</h3>
          )}
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
      item: { id: ticket.id, taskId, ticketId: ticket.id, type: ItemTypes.TICKET },
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

  const moveTicket = async (sourceTaskId, destinationTaskId, ticketId) => {
    const sourceTask = tasks.find((task) => task.id === sourceTaskId);
    const destinationTask = tasks.find((task) => task.id === destinationTaskId);
    const movedTicket = sourceTask.tickets.find((ticket) => ticket.id === ticketId);

    const updatedSourceTickets = sourceTask.tickets.filter((ticket) => ticket.id !== ticketId);
    const updatedDestinationTickets = [...destinationTask.tickets];

    const ticketToUpdate = { ...movedTicket };
    if (destinationTask.title === "Close") {
      ticketToUpdate.closedAt = new Date();
    }
    updatedDestinationTickets.push(ticketToUpdate);

    const updatedTasks = tasks.map((task) => {
      if (task.id === sourceTaskId) {
        return { ...task, tickets: updatedSourceTickets };
      } else if (task.id === destinationTaskId) {
        return { ...task, tickets: updatedDestinationTickets };
      } else {
        return task;
      }
    });

    setTasks(updatedTasks);
    await updateTaskTicketsInFirebase(sourceTaskId, updatedSourceTickets);
    await updateTaskTicketsInFirebase(destinationTaskId, updatedDestinationTickets);
  };

  const updateTaskTicketsInFirebase = async (taskId, tickets) => {
    try {
      const taskRef = doc(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`, taskId);
      await updateDoc(taskRef, { tickets });
    } catch (error) {
      console.error("Error updating task tickets:", error);
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
      id: Date.now().toString(),
      ...ticketData,
      assignee: ticketData.assignee ? ticketData.assignee.name : '',
      assigner: ticketData.assigner ? ticketData.assigner.name : '',
      createdAt: new Date(),
    };

    try {
      const updatedTickets = [...task.tickets, newTicket];
      await updateTaskTicketsInFirebase(selectedTaskId, updatedTickets);

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
          {tasks.map((task, index) => (
            <TaskColumn key={task.id} task={task} index={index} />
          ))}
          {/* "Create Task" box as the last item in the row */}
          <div className="create-task-box" onClick={createNewColumn}>+ Create Task</div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Add New Ticket</h2>
        <form onSubmit={submitTicket}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            onChange={handleTicketInput}
            value={ticketData.title}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleTicketInput}
            value={ticketData.description}
            required
          ></textarea>
          <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleTicketInput}
            value={ticketData.category}
          />
          <label>Assignee</label>
          <Dropdown
            options={workspaceUsers}
            selected={ticketData.assignee}
            onSelect={(user) => setTicketData((prev) => ({ ...prev, assignee: user }))}
            placeholder="Select Assignee"
          />
          <label>Assigner</label>
          <Dropdown
            options={workspaceUsers}
            selected={ticketData.assigner}
            onSelect={(user) => setTicketData((prev) => ({ ...prev, assigner: user }))}
            placeholder="Select Assignor"
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
