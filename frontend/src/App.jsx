import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import AttendanceTracking from './components/AttendanceTracking';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>📚 Sunday School Dashboard</h1>
        <div className="header-right">
          <span className="user-info">Welcome, {user.username}</span>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            👥 Members
          </button>
          <button 
            className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            ✓ Attendance
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'members' && <MemberManagement />}
          {activeTab === 'attendance' && <AttendanceTracking />}
        </div>
      </main>
    </div>
  );
}

export default App;
