import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import PrepManagement from './components/PrepManagement';
import AttendanceTracking from './components/AttendanceTracking';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user, logout, loading } = useAuth();

  const handleProtectedTabClick = (tab) => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginPrompt(false);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (showLoginPrompt) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>📚 Sunday School Dashboard</h1>
        {user && (
          <div className="header-right">
            <span className="user-info">👤 {user.username}</span>
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        )}
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
            onClick={() => handleProtectedTabClick('members')}
          >
            👥 Members {!user && '🔒'}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'prep' ? 'active' : ''}`}
            onClick={() => handleProtectedTabClick('prep')}
          >
            🏛️ Temple/Mission {!user && '🔒'}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => handleProtectedTabClick('attendance')}
          >
            ✓ Attendance {!user && '🔒'}
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'members' && user && <MemberManagement />}
          {activeTab === 'prep' && user && <PrepManagement />}
          {activeTab === 'attendance' && user && <AttendanceTracking />}
        </div>
      </main>
    </div>
  );
}

export default App;
