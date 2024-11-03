import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryLegend } from 'victory';
import '../css/Analytics.css';

const Analytics = ({ workspaceCode }) => {
  const [sprintData, setSprintData] = useState([]);
  const [expandedSprint, setExpandedSprint] = useState(null);
  const [teamStats, setTeamStats] = useState([]); // Track team stats

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const sprintsRef = collection(db, `workspace/${workspaceCode}/sprints`);
        const sprintsSnapshot = await getDocs(sprintsRef);

        const sprints = await Promise.all(
          sprintsSnapshot.docs.map(async (sprintDoc) => {
            const sprintId = sprintDoc.id;
            const sprintInfo = sprintDoc.data();

            const tasksSnapshot = await getDocs(collection(db, `workspace/${workspaceCode}/sprints/${sprintId}/tasks`));
            let totalTickets = 0;
            let closedTickets = 0;
            let ticketsData = [];
            let memberStats = {}; // Track stats per member

            tasksSnapshot.docs.forEach((taskDoc) => {
              const taskData = taskDoc.data();
              const tickets = taskData.tickets || [];
              totalTickets += tickets.length;

              tickets.forEach(ticket => {
                const createdAt = ticket.createdAt ? ticket.createdAt.toDate() : null;
                const closedAt = ticket.closedAt ? ticket.closedAt.toDate() : null;
                const assignee = ticket.assignee || "Unassigned";

                // Update member stats
                if (!memberStats[assignee]) {
                  memberStats[assignee] = { received: 0, closed: 0 };
                }
                memberStats[assignee].received += 1;
                if (closedAt) {
                  memberStats[assignee].closed += 1;
                }

                if (createdAt) {
                  ticketsData.push({
                    createdAt,
                    closedAt,
                  });
                }

                if (taskData.title === "Close") {
                  closedTickets++;
                }
              });
            });

            const closePercentage = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;

            return {
              name: sprintInfo.name || sprintId,
              totalTickets,
              closedTickets,
              closePercentage,
              ticketsData,
              memberStats,
            };
          })
        );

        setSprintData(sprints.reverse());
      } catch (error) {
        console.error("Error fetching sprints:", error);
        setSprintData([]);
      }
    };

    if (workspaceCode) {
      fetchSprints();
    }
  }, [workspaceCode]);

  const handleSprintClick = (index) => {
    setExpandedSprint(index === expandedSprint ? null : index);
  };

  const getChartData = (ticketsData) => {
    if (!ticketsData || ticketsData.length === 0) {
      return [];
    }

    const data = ticketsData.map(ticket => ({
      date: ticket.createdAt.toISOString().split('T')[0],
      open: 1,
      closed: ticket.closedAt ? 1 : 0,
    }));

    const aggregatedData = [];
    let openCount = 0;
    let closedCount = 0;

    data.forEach((entry) => {
      openCount += entry.open;
      closedCount += entry.closed;
      aggregatedData.push({
        date: entry.date,
        open: openCount,
        closed: closedCount,
      });
    });

    return aggregatedData;
  };

  return (
    <div className="analytics-container">
      <h2>Analytics</h2>
      <div className="analytics-content">
        {sprintData.map((sprint, index) => (
          <div key={index} className={`analytics-item ${expandedSprint === index ? 'expanded' : ''}`} onClick={() => handleSprintClick(index)}>
            <div className="analytics-item-left">
              <h3>{sprint.name}</h3>
            </div>
            <div className="analytics-item-right">
              <p>Total Tickets: {sprint.totalTickets}</p>
              <p>Closed Tickets: {sprint.closedTickets}</p>
              <p>Progress %: {sprint.closePercentage}%</p>
            </div>
            {expandedSprint === index && (
              <div className="analytics-details">
                <VictoryChart
                  containerComponent={<VictoryVoronoiContainer />}
                  domainPadding={{ x: 20, y: 20 }}
                >
                  <VictoryLegend x={125} y={10}
                    title="Ticket Progress"
                    orientation="horizontal"
                    gutter={20}
                    style={{ title: { fontSize: 15 } }}
                    data={[
                      { name: "Open Tickets", symbol: { fill: "#8884d8" } },
                      { name: "Closed Tickets", symbol: { fill: "#82ca9d" } }
                    ]}
                  />
                  <VictoryAxis
                    dependentAxis
                    domain={[0, 'auto']}
                    label="Tickets"
                    style={{
                      axisLabel: { padding: 30 },
                    }}
                  />
                  <VictoryAxis
                    tickFormat={(t) => t}
                    style={{
                      tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' },
                    }}
                  />
                  <VictoryLine
                    data={getChartData(sprint.ticketsData)}
                    x="date"
                    y="open"
                    animate={{
                      duration: 1000,
                      onLoad: { duration: 1000 }
                    }}
                    style={{ data: { stroke: "#8884d8" } }}
                    labels={({ datum }) => `Open: ${datum.open}`}
                    labelComponent={<VictoryTooltip />}
                  />
                  <VictoryLine
                    data={getChartData(sprint.ticketsData)}
                    x="date"
                    y="closed"
                    animate={{
                      duration: 1000,
                      onLoad: { duration: 1000 }
                    }}
                    style={{ data: { stroke: "#82ca9d" } }}
                    labels={({ datum }) => `Closed: ${datum.closed}`}
                    labelComponent={<VictoryTooltip />}
                  />
                </VictoryChart>

                {/* Team stats section */}
                <div className="team-stats">
                  <h4>Team Ticket Stats</h4>
                  {Object.keys(sprint.memberStats).map(member => (
                    <div key={member} className="team-stat-item">
                      <p><strong>{member}</strong></p>
                      <p>Received: {sprint.memberStats[member].received}</p>
                      <p>Closed: {sprint.memberStats[member].closed}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
