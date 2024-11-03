import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryLegend } from 'victory';
import '../css/Analytics.css';
import TreeLeftPopUp from '../components/TreeLeftPopUp';
import TreeRightPopUp from '../components/TreeRightPopUp';

const Analytics = ({ workspaceCode }) => {
  const [sprintData, setSprintData] = useState([]);
  const [expandedSprint, setExpandedSprint] = useState(null);

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
                    createdAt: createdAt.toISOString().split('T')[0],
                    closedAt: closedAt ? closedAt.toISOString().split('T')[0] : null,
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
      date: ticket.createdAt,
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
              {expandedSprint === index && (
                <div className="team-stats">
                  <h4>Team Ticket Stats</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Assigned</th>
                        <th>Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(sprint.memberStats).map(member => (
                        <tr key={member}>
                          <td>{member}</td>
                          <td>{sprint.memberStats[member].received}</td>
                          <td>{sprint.memberStats[member].closed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  domainPadding={{ x: 30, y: 20 }}
                >
                  <VictoryLegend x={125} y={10}
                    title="Ticket Progress"
                    orientation="horizontal"
                    gutter={20}
                    style={{ title: { fontSize: 15 } }}
                    data={[
                      { name: "Open Tickets", symbol: { fill: "#4f81bd" } },
                      { name: "Closed Tickets", symbol: { fill: "#c0504d" } }
                    ]}
                  />
                  <VictoryAxis
                    dependentAxis
                    label="Tickets"
                    style={{
                      axisLabel: { padding: 35, fontSize: 12 },
                      tickLabels: { fontSize: 10 },
                      grid: { stroke: "#ddd", strokeDasharray: "4 4" },
                    }}
                    tickFormat={(y) => `${y}`}
                  />
                  <VictoryAxis
                    label="Date"
                    style={{
                      axisLabel: { padding: 30, fontSize: 12 },
                      tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' },
                      grid: { stroke: "#ddd", strokeDasharray: "4 4" },
                    }}
                    tickFormat={(x) => `${x}`}
                  />
                  <VictoryLine
                    data={getChartData(sprint.ticketsData)}
                    x="date"
                    y="open"
                    interpolation="monotoneX"
                    animate={{
                      duration: 1500,
                      onLoad: { duration: 1500 }
                    }}
                    style={{ data: { stroke: "#4f81bd", strokeWidth: 2 } }}
                    labels={({ datum }) => `Open: ${datum.open}`}
                    labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
                  />
                  <VictoryLine
                    data={getChartData(sprint.ticketsData)}
                    x="date"
                    y="closed"
                    interpolation="monotoneX"
                    animate={{
                      duration: 1500,
                      onLoad: { duration: 1500 }
                    }}
                    style={{ data: { stroke: "#c0504d", strokeWidth: 2 } }}
                    labels={({ datum }) => `Closed: ${datum.closed}`}
                    labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
                  />
                </VictoryChart>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
