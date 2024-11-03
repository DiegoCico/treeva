import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryLegend } from 'victory';

const TreeRightPopUp = ({ currentSprint }) => {
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
        <div
            style={{
                position: 'absolute',
                top: '50%',
                right: '20%',
                transform: 'translate(50%, -50%)',
                padding: '20px',
                background: 'rgba(255,255,255)',
                color: 'white',
                borderRadius: '5px',
                fontWeight: 'bold'
            }}
        >
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
                    data={getChartData(currentSprint.ticketsData)}
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
                    data={getChartData(currentSprint.ticketsData)}
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
            Right Popup Content
        </div>
    );
};

export default TreeRightPopUp;
