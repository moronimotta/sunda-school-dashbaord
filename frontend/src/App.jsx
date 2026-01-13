import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import AttendanceTracking from './components/AttendanceTracking';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      <header className="header">
        <h1>📚 Sunday School Dashboard</h1>
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
