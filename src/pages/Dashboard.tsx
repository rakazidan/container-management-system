import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');

  // Mock data - replace with actual data from API/state
  const totalContainers = 156;
  const totalSpace = 180; // Total available positions (5 zones * 9 positions * 4 stacks)
  const usedSpace = 92;
  const averageStack = 2.3;
  const microDeviceStatus = 'Connected';

  // Mock data for different years
  const yearlyData: { [key: string]: Array<{ date: string; count: number }> } = {
    '2022': [
      { date: 'Jan 22', count: 85 },
      { date: 'Feb 22', count: 92 },
      { date: 'Mar 22', count: 88 },
      { date: 'Apr 22', count: 95 },
      { date: 'May 22', count: 102 },
      { date: 'Jun 22', count: 98 },
      { date: 'Jul 22', count: 105 },
      { date: 'Aug 22', count: 110 },
      { date: 'Sep 22', count: 108 },
      { date: 'Oct 22', count: 115 },
      { date: 'Nov 22', count: 122 },
      { date: 'Dec 22', count: 118 },
    ],
    '2023': [
      { date: 'Jan 23', count: 105 },
      { date: 'Feb 23', count: 112 },
      { date: 'Mar 23', count: 118 },
      { date: 'Apr 23', count: 115 },
      { date: 'May 23', count: 128 },
      { date: 'Jun 23', count: 135 },
      { date: 'Jul 23', count: 142 },
      { date: 'Aug 23', count: 138 },
      { date: 'Sep 23', count: 145 },
      { date: 'Oct 23', count: 152 },
      { date: 'Nov 23', count: 158 },
      { date: 'Dec 23', count: 155 },
    ],
    '2024': [
      { date: 'Jan 24', count: 120 },
      { date: 'Feb 24', count: 135 },
      { date: 'Mar 24', count: 142 },
      { date: 'Apr 24', count: 128 },
      { date: 'May 24', count: 155 },
      { date: 'Jun 24', count: 148 },
      { date: 'Jul 24', count: 162 },
      { date: 'Aug 24', count: 138 },
      { date: 'Sep 24', count: 145 },
      { date: 'Oct 24', count: 158 },
      { date: 'Nov 24', count: 172 },
      { date: 'Dec 24', count: 165 },
    ],
  };

  // Mock daily container data (last 12 months)
  const dailyData = yearlyData[selectedYear] || yearlyData['2024'];

  // Mock movement log data
  const movementLogs = [
    { time: '30 Nov 2025 14:30', crane: 'Controller 1', container: 'TCLU1234567', from: 'A1.03', to: 'B2.01' },
    { time: '30 Nov 2025 13:45', crane: 'Controller 2', container: 'MSCU9876543', from: 'C3.04', to: 'A1.02' },
    { time: '30 Nov 2025 12:20', crane: 'Controller 1', container: 'CMAU5551234', from: 'B2.02', to: 'D1.03' },
    { time: '30 Nov 2025 11:15', crane: 'Controller 3', container: 'HLCU7778888', from: 'D4.01', to: 'E3.04' },
    { time: '30 Nov 2025 10:30', crane: 'Controller 2', container: 'OOLU4445566', from: 'E1.03', to: 'C2.01' },
    { time: '30 Nov 2025 09:45', crane: 'Controller 1', container: 'TCLU2223344', from: 'A3.02', to: 'B1.04' },
    { time: '30 Nov 2025 09:00', crane: 'Controller 4', container: 'MSCU6667788', from: 'B4.04', to: 'A2.02' },
    { time: '29 Nov 2025 16:30', crane: 'Controller 2', container: 'CMAU9990011', from: 'C1.01', to: 'D3.03' },
    { time: '29 Nov 2025 15:45', crane: 'Controller 1', container: 'HLCU3334455', from: 'D2.03', to: 'E1.01' },
    { time: '29 Nov 2025 14:20', crane: 'Controller 3', container: 'OOLU1112233', from: 'E3.02', to: 'A4.04' },
    { time: '29 Nov 2025 13:15', crane: 'Controller 2', container: 'TCLU5556677', from: 'A2.01', to: 'B3.02' },
    { time: '29 Nov 2025 12:30', crane: 'Controller 1', container: 'MSCU8889900', from: 'B1.03', to: 'C4.01' },
    { time: '29 Nov 2025 11:45', crane: 'Controller 4', container: 'CMAU2221133', from: 'C2.04', to: 'D4.02' },
    { time: '29 Nov 2025 10:00', crane: 'Controller 2', container: 'HLCU6665544', from: 'D3.01', to: 'E2.03' },
    { time: '29 Nov 2025 09:15', crane: 'Controller 1', container: 'OOLU9998877', from: 'E4.04', to: 'A3.01' },
    { time: '28 Nov 2025 16:30', crane: 'Controller 3', container: 'TCLU3332211', from: 'A1.04', to: 'B4.03' },
    { time: '28 Nov 2025 15:45', crane: 'Controller 2', container: 'MSCU7776655', from: 'B2.01', to: 'C1.02' },
    { time: '28 Nov 2025 14:20', crane: 'Controller 1', container: 'CMAU4443322', from: 'C3.03', to: 'D2.04' },
    { time: '28 Nov 2025 13:15', crane: 'Controller 4', container: 'HLCU1119988', from: 'D1.02', to: 'E3.01' },
    { time: '28 Nov 2025 12:30', crane: 'Controller 2', container: 'OOLU5554433', from: 'E2.04', to: 'A4.02' },
  ];

  const maxCount = Math.max(...dailyData.map(d => d.count));

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Hello @user</h1>
        <p className="welcome-subtitle">Let's Analyze and Track your container location</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Containers</div>
              <div className="stat-value">{totalContainers}</div>
              <div className="stat-description">Registered in system</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Space Usage</div>
              <div className="stat-value">{((usedSpace/totalSpace) * 100).toFixed(1)}%</div>
              <div className="stat-description">{usedSpace}/{totalSpace} positions utilized</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Average Stack</div>
              <div className="stat-value">{averageStack.toFixed(1)}</div>
              <div className="stat-description">Per position</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Micro Device Status</div>
              <div className={`stat-value status-${microDeviceStatus.toLowerCase()}`}>{microDeviceStatus}</div>
              <div className="stat-description">Real-time monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Moving Container Statistics</h3>
            <select 
              className="year-filter" 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="bar-chart">
            {dailyData.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{ height: `${(item.count / maxCount) * 100}%` }}
                  >
                    <span className="bar-value">{item.count}</span>
                  </div>
                </div>
                <div className="bar-label">{item.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Movement Log Container (Last 20)</h3>
          <div className="recent-containers">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Crane</th>
                  <th>Container</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {movementLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="time-cell">{log.time}</td>
                    <td className="crane-cell">{log.crane}</td>
                    <td className="container-num">{log.container}</td>
                    <td className="location-cell">{log.from}</td>
                    <td className="location-cell">{log.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
