import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    newMembers: 0,
  });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      // Gọi 3 API cùng lúc
      const [statsRes, activitiesRes, chartRes] = await Promise.all([
        fetch("http://localhost:8080/api/dashboard/overview", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/dashboard/recent-activities", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/dashboard/weekly-activity", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      const chartDataRes = await chartRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (activitiesData.success && activitiesData.data.length > 0) {
        setActivities(activitiesData.data);
      } else {
        // Dữ liệu mẫu
        setActivities([
          {
            type: "return",
            title: "Book Returned",
            book: '"The Great Gatsby"',
            time: "Just now",
            user: "Member #8492",
          },
          {
            type: "reserve",
            title: "New Reservation",
            book: '"Atomic Habits"',
            time: "14 mins ago",
            user: "Member #1023",
          },
        ]);
      }

      if (chartDataRes.success && chartDataRes.data.length > 0) {
        setChartData(chartDataRes.data);
      } else {
        setChartData([
          { day: "MON", count: 120 },
          { day: "TUE", count: 195 },
          { day: "WED", count: 165 },
          { day: "THU", count: 270 },
          { day: "FRI", count: 225 },
          { day: "SAT", count: 135 },
          { day: "SUN", count: 90 },
        ]);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[dayNum - 1] || "MON";
  };

  const getBarHeight = (value) => {
    const maxValue = Math.max(
      ...chartData.map((item) => item.count || item.value),
      1
    );
    return (value / maxValue) * 100;
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Library Overview</h1>
        <p>
          Welcome back, Admin. Here's what's happening in the main branch today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Books</span>
            <i className="fa-solid fa-book stat-icon"></i>
          </div>
          <div className="stat-value">{stats.totalBooks.toLocaleString()}</div>
          <div className="stat-trend positive">
            <i className="fa-solid fa-arrow-up"></i> In library
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Currently Borrowed</span>
            <i className="fa-solid fa-exchange-alt stat-icon"></i>
          </div>
          <div className="stat-value">
            {stats.borrowedBooks.toLocaleString()}
          </div>
          <div className="stat-trend neutral">
            <i className="fa-solid fa-clock"></i> Active loans
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Overdue Items</span>
            <i className="fa-solid fa-bell stat-icon"></i>
          </div>
          <div className="stat-value" style={{ color: "#ef4444" }}>
            {stats.overdueBooks}
          </div>
          <div className="stat-trend negative">
            <i className="fa-solid fa-triangle-exclamation"></i> Requires
            attention
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">New Members</span>
            <i className="fa-solid fa-user-plus stat-icon"></i>
          </div>
          <div className="stat-value">{stats.newMembers}</div>
          <div className="stat-trend positive">
            <i className="fa-solid fa-circle-check"></i> This month
          </div>
        </div>
      </div>

      <div className="dashboard-main-row">
        <div className="activity-section">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h2>Weekly Borrowing Activity</h2>
              <span className="view-all">Last 7 Days</span>
            </div>
            <div className="chart-container">
              <div className="chart-bars">
                {chartData.map((item, idx) => (
                  <div className="chart-bar-item" key={idx}>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${getBarHeight(item.count || item.value)}%`,
                        }}
                      >
                        <span className="bar-value">
                          {item.count || item.value}
                        </span>
                      </div>
                    </div>
                    <span className="bar-label">
                      {item.day || getDayName(item.day)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="right-panels">
          <div className="quick-actions-panel">
            <button
              className="action-btn"
              onClick={() => (window.location.href = "/admin/books/add")}
            >
              <i className="fa-solid fa-plus"></i> Add New Book
            </button>
            <button className="action-btn">
              <i className="fa-solid fa-right-from-bracket"></i> Register
              Check-out
            </button>
            <button className="action-btn">
              <i className="fa-solid fa-user-plus"></i> New Member Signup
            </button>
            <button className="action-btn">
              <i className="fa-solid fa-file-export"></i> Generate Reports
            </button>
          </div>

          <div className="system-alert">
            <div className="alert-icon">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <div className="alert-content">
              <h4>System Alert</h4>
              <p>Server is running normally. All systems operational.</p>
            </div>
          </div>

          <div className="dashboard-card recent-activity">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <a href="#" className="view-all">
                View All
              </a>
            </div>
            <div className="recent-activity-list">
              {activities.map((activity, idx) => (
                <div className="activity-item" key={idx}>
                  <div className={`activity-icon-box ${activity.type}`}>
                    {activity.type === "return" && (
                      <i className="fa-solid fa-arrow-left"></i>
                    )}
                    {activity.type === "reserve" && (
                      <i className="fa-solid fa-bookmark"></i>
                    )}
                    {activity.type === "member" && (
                      <i className="fa-solid fa-user-check"></i>
                    )}
                  </div>
                  <div className="activity-details">
                    <h5>{activity.title}</h5>
                    <p>{activity.book}</p>
                    <p className="activity-time">
                      {activity.time} • {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
