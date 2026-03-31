import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getDashboardStats, getMovementLogs, getChartData } from '../services/api';

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    total_containers: 0,
    total_zones: 0,
    used_zones: 0,
    empty_zones: 0,
    space_usage_percent: 0,
    average_stack: 0,
    device_status: 'loading...',
  });
  const [chartData, setChartData] = useState<Array<{ date: string; count: number }>>([]);
  const [movementLogs, setMovementLogs] = useState<Array<{
    time: string; operator: string; container: string; from: string; to: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch stats & movement logs sekali saja
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          getDashboardStats() as Promise<any>,
          getMovementLogs(20) as Promise<any>,
        ]);
        setStats(statsRes.data);
        setMovementLogs(
          logsRes.data.map((l: any) => ({
            time: l.time,
            operator: l.operator,
            container: l.container,
            from: l.from,
            to: l.to,
          }))
        );
      } catch (e) {
        setError('Failed to load dashboard data');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  // Fetch chart data saat tahun berubah
  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await getChartData(selectedYear) as any;
        setChartData(res.data);
      } catch (e) {
        console.error('Chart data error:', e);
      }
    };
    fetchChart();
  }, [selectedYear]);

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count), 1) : 1;
  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="welcome-card">
          <p style={{ color: '#aaa', padding: '2rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Hello @user</h1>
        <p className="welcome-subtitle">Let's Analyze and Track your container location</p>
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Containers</div>
              <div className="stat-value">{stats.total_containers}</div>
              <div className="stat-description">Currently in yard</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Space Usage</div>
              <div className="stat-value">{stats.space_usage_percent.toFixed(1)}%</div>
              <div className="stat-description">{stats.used_zones}/{stats.total_zones} zones utilized</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Average Stack</div>
              <div className="stat-value">{stats.average_stack.toFixed(1)}</div>
              <div className="stat-description">Per active zone</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Micro Device Status</div>
              <div className={`stat-value status-${stats.device_status.toLowerCase()}`}>
                {stats.device_status}
              </div>
              <div className="stat-description">Real-time monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Container Arrivals per Month</h3>
            <select
              className="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[currentYear - 2, currentYear - 1, currentYear].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="bar-chart">
            {chartData.map((item, index) => (
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
                  <th>Operator</th>
                  <th>Container</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {movementLogs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa' }}>No movement logs yet</td></tr>
                ) : (
                  movementLogs.map((log, index) => (
                    <tr key={index}>
                      <td className="time-cell">{log.time}</td>
                      <td className="crane-cell">{log.operator}</td>
                      <td className="container-num">{log.container}</td>
                      <td className="location-cell">{log.from}</td>
                      <td className="location-cell">{log.to}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
