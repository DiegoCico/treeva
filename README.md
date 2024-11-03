# Treeva

This repository is a task management and visualization app designed to enhance productivity and team collaboration with a unique 3D tree representation of sprint progress. With features like dark and light modes, Firebase integration, detailed user profiles, team analytics, and task management, this app provides an engaging and intuitive way to manage projects.

## Inspiration

We wanted to make project management fun and something people actually look forward to using every day. The idea of a 3D tree for tracking sprints came from wanting to see progress in a way that feels alive — you’re literally watching your work “grow”! Traditional task tools can feel dull and complicated, so we set out to create something interactive and visually apelling, with real-time updates and easy team stats. Treeva is all about making teamwork feel rewarding and keeping things simple but powerful, so every task done is like leveling up together.

## Challenges We Faced

1. **Performance with 3D Graphics**: Rendering 3D trees can be demanding, especially on lower-end devices. Keeping everything smooth without lag might require optimization to prevent slow load times.

2. **Scaling for Larger Teams**: With more users and tasks, managing data can get complicated, especially with analytics and team stats. Ensuring Treeva can handle a lot of data without lag will be key as teams grow.

3. **User Customization**: Keeping things simple while still allowing for individual preferences (like dark/light mode, custom themes, etc.) can be challenging without cluttering the interface.

4. **Keeping Data Secure**: Since Treeva deals with sensitive team and project data, ensuring solid security practices in Firebase and across the app will be critical, especially for bigger teams.

5. **3D Navigation and Usability**: Getting users comfortable with navigating a 3D environment for tasks might require tutorials or tips, as not everyone is familiar with interactive 3D interfaces.

## What we Learned
1. **Balancing Aesthetics and Functionality**: We realized how challenging it is to create a visually engaging experience that’s also practical. Making the 3D tree look good without sacrificing usability was a big learning curve.

2. **Optimizing Real-Time Features**: Working with Firebase taught us a lot about handling real-time data. Syncing updates across users quickly and reliably showed us the importance of efficient data structuring and handling.

3. **User-Centric Design for Unique Interfaces**: Designing a 3D task tracker made us think deeply about user experience. Not everyone is used to navigating a 3D space, so we had to simplify interactions and provide hints to help users get comfortable.

4. **Handling Cross-Device Performance**: Ensuring that Treeva performs well on both high-end and low-end devices pushed us to optimize heavily, especially with the 3D elements. We learned how important it is to balance visuals with performance.

5. **Security and Data Privacy**: Working with Firebase reminded us that keeping data secure isn’t just a feature — it’s a priority. We had to make sure that each part of our app followed best practices for data security and privacy.

6. **Flexibility in User Preferences**: With features like dark and light mode, we learned that small customization options can make a big difference. Flexibility helps users feel more at home with the app, so we plan to keep expanding on this idea.

## Features

- **3D Tree Visualization**: Sprint tasks are visualized as trees on an island, providing a fun and interactive way to track progress. Each tree stage reflects the percentage of completed tasks, giving a visual snapshot of sprint health.
- **Interactive Dark/Light Modes**: Customize the appearance of the app with a toggle between dark and light modes, ensuring a comfortable user experience.
- **User Profile and Progress Tracking**: Displays user information, team members, and an animated progress circle based on closed tickets, helping users track their individual contributions.
- **Team Collaboration and Analytics**: Track progress per sprint with a breakdown of tickets assigned to each team member. Detailed statistics and charts help teams understand performance over time.
- **Firebase Integration**: Real-time data storage and retrieval using Firebase Firestore for managing users, tasks, and sprints. All data is securely stored and accessible across devices.
- **Responsive and Mobile-Friendly Design**: Adaptable for both desktop and mobile environments, ensuring that team members can stay updated on the go.
- **Task Management with Ticket System**: Add, edit, and delete tasks within sprints. Each task includes tickets that can be assigned, reassigned, and marked as completed.
- **Dynamic Task Categories and Difficulties**: Supports categorizing tasks and assigning difficulty levels, allowing teams to prioritize work effectively.
- **Intuitive User Interface**: Includes animated elements, smooth transitions, and tooltips for an improved user experience, making project management both functional and visually appealing.

## Code Overview

### Key Components

1. **`Homepage`**:
   - Manages active views, allowing users to switch between the User Profile, Sprints, and 3D Visualization.
   - Retrieves and displays user and workspace data from Firebase Firestore.

2. **`IslandScene`**:
   - Renders the 3D tree visualization for sprints, with animations and camera movement based on user interactions.
   - Each tree stage is represented by a unique GLTF model, allowing for visually distinct stages of progress.

3. **`Analytics`**:
   - Uses Victory charts to render ticket stats, providing insights into sprint progress and individual contributions.
   - Displays member stats with ticket assignments and closures, giving teams a clear view of each member's productivity.

4. **`UserProfile`**:
   - Shows detailed user information, lists team members, and displays a progress circle with color-coded indicators for completion percentage.

### Firebase Structure

- **Users**: Stores user profile information, including personal details and contact information.
- **Workspaces**: Contains workspace-level data, including sprints, tasks, and team members. Holds task data, each containing a series of tickets for more granular tracking.

![alt text](FirebaseStructure.png)

## Dependencies

- **React**: Frontend framework for building a responsive, interactive UI.
- **@react-three/fiber**: Integrates Three.js with React for the 3D tree visualizations.
- **Firebase API**: Real-time database and authentication for storing and managing project data, allowing teams to collaborate and update tasks in real time. 
- **Victory**: Charting library for rendering analytics, making it easy to track sprint progress and visualize team statistics.

## Future Improvements

- **Task Comments and Attachments**: Allow team members to add comments and attach files to tasks, enhancing collaboration and detail-sharing.
- **Enhanced User Roles and Permissions**: Add user roles such as Admin, Member, and Viewer, each with specific permissions for creating, editing, or viewing tasks.
- **Notifications and Reminders**: Implement a notification system for upcoming deadlines and reminders for incomplete tasks.
- **Enhanced Analytics**: Add more detailed charts and graphs, such as individual performance analytics, sprint overviews, and burndown charts.
- **Enhanced UI & UX**: Include more animations and make everything seem prettier. 
- **Integrations with Other Platforms**: Support integrations with popular platforms like Slack, Trello, and Google Calendar for cross-platform synchronization.
- **AI-Powered Task Recommendations**: Use machine learning to analyze user productivity and suggest task prioritization or workflow improvements.