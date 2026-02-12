import React, { useState, useEffect } from 'react';
import { attendanceAPI, membersAPI, exportAPI } from '../services/api';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subMonths, differenceInWeeks } from 'date-fns';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSunday, setSelectedSunday] = useState('semester');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sheetsConfigured, setSheetsConfigured] = useState(false);
  const [missedGenderFilter, setMissedGenderFilter] = useState('all');
  const [missedColorFilter, setMissedColorFilter] = useState('all');

  // Semester Sunday dates
  const semesterSundays = [
    { date: '2026-01-18', label: 'Jan 18 (Week 1)' },
    { date: '2026-02-01', label: 'Feb 1 (Week 2)' },
    { date: '2026-02-15', label: 'Feb 15 (Week 3)' },
    { date: '2026-03-01', label: 'Mar 1 (Week 4)' },
    { date: '2026-03-15', label: 'Mar 15 (Week 5)' },
    { date: '2026-04-05', label: 'Apr 5 (Week 6)' }
  ];

  // Calculate current Come Follow Me lesson number (changes every week)
  const getCurrentLessonNumber = () => {
    // Start date for the year (Jan 5-11, 2026 is week 1, Monday-start)
    const yearStart = new Date('2026-01-05');
    const today = new Date();
    // If today is Sunday, use the next day (Monday) to select the upcoming week's assignment
    const effectiveDate = today.getDay() === 0
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      : today;
    const weeksPassed = differenceInWeeks(effectiveDate, yearStart);
    const lessonNumber = weeksPassed + 1; // Week 1 starts on Jan 5
    return Math.max(1, Math.min(lessonNumber, 53)); // Lessons 1-53 for full year
  };

  // Get current week date range label (e.g., "Feb 2–8") using Monday-start weeks
  const getCurrentWeekLabel = () => {
    const today = new Date();
    const effectiveDate = today.getDay() === 0
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      : today;
    const day = effectiveDate.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    const daysToMonday = (day + 6) % 7; // distance back to Monday
    const start = new Date(effectiveDate);
    start.setDate(effectiveDate.getDate() - daysToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startLabel = format(start, 'MMM d');
    const endLabel = format(end, 'd');
    return `${startLabel}–${endLabel}`;
  };

  useEffect(() => {
    fetchData();
  }, [selectedSunday]);

  useEffect(() => {
    checkSheetsStatus();
  }, []);

  const getDateRange = () => {
    if (selectedSunday === 'semester') {
      // Full semester range
      return {
        startDate: '2026-01-18',
        endDate: '2026-04-05'
      };
    } else {
      // Individual Sunday - use same date for start and end
      return {
        startDate: selectedSunday,
        endDate: selectedSunday
      };
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const [statsResponse, membersResponse, attendanceResponse] = await Promise.all([
        attendanceAPI.getStats(startDate, endDate),
        membersAPI.getAll(),
        attendanceAPI.getAll()
      ]);
      setStats(statsResponse.data);
      setMembers(membersResponse.data);
      setAllAttendance(attendanceResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const checkSheetsStatus = async () => {
    try {
      const response = await exportAPI.getStatus();
      setSheetsConfigured(response.data.configured);
    } catch (error) {
      console.error('Error checking Google Sheets status:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleExportToSheets = async () => {
    if (!sheetsConfigured) {
      showMessage('error', 'Google Sheets is not configured. Please set up credentials in the backend.');
      return;
    }

    try {
      setExporting(true);
      const { startDate, endDate } = getDateRange();
      const response = await exportAPI.exportAll(startDate, endDate);
      
      if (response.data.success) {
        showMessage('success', `Exported ${response.data.rowsWritten} rows to Google Sheets!`);
        // Open the spreadsheet in a new tab
        window.open(response.data.spreadsheetUrl, '_blank');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to export to Google Sheets');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!stats) {
    return <div className="card">Unable to load statistics</div>;
  }

  // Check if there's any data to display
  const hasData = stats.presentCount > 0 || stats.readAssignmentCount > 0;

  // Prepare data for charts
  const totalSlotsMale = stats.maleMembers * (stats.datesIncluded || 1);
  const totalSlotsFemale = stats.femaleMembers * (stats.datesIncluded || 1);
  
  const genderAttendanceData = [
    { 
      name: 'Male', 
      total: totalSlotsMale, 
      attended: stats.maleAttendance,
      percentage: totalSlotsMale > 0 ? ((stats.maleAttendance / totalSlotsMale) * 100).toFixed(1) : 0
    },
    { 
      name: 'Female', 
      total: totalSlotsFemale, 
      attended: stats.femaleAttendance,
      percentage: totalSlotsFemale > 0 ? ((stats.femaleAttendance / totalSlotsFemale) * 100).toFixed(1) : 0
    }
  ];

  const categoryAttendanceData = [
    { name: 'Temple Prep', value: stats.templePrepAttendance, total: stats.templePrepMembers * (stats.templePrepWeeks || 1) },
    { name: 'Mission Prep', value: stats.missionPrepAttendance, total: stats.missionPrepMembers * (stats.missionPrepWeeks || 1) }
  ];

  const overallData = [
    { name: 'Present', value: stats.presentCount },
    { name: 'Absent', value: stats.totalAttendanceRecords - stats.presentCount }
  ];

  const assignmentData = [
    { name: 'Read Assignment', value: stats.readAssignmentCount },
    { name: 'Did Not Read', value: stats.presentCount - stats.readAssignmentCount }
  ];

  const attendanceRate = stats.totalAttendanceRecords > 0
    ? ((stats.presentCount / stats.totalAttendanceRecords) * 100).toFixed(1)
    : 0;

  const assignmentRate = stats.presentCount > 0
    ? ((stats.readAssignmentCount / stats.presentCount) * 100).toFixed(1)
    : 0;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const regularClassDatesSoFar = semesterSundays
    .map((sunday) => sunday.date)
    .filter((date) => date <= todayStr);
  const totalRegularClassesSoFar = regularClassDatesSoFar.length;

  const regularMembers = members.filter((member) => member.category === 'regular');
  const presentLookup = new Set(
    allAttendance
      .filter((record) => {
        const dateKey = record.date?.slice(0, 10);
        const memberCategory = record.memberId?.category;
        return record.present && memberCategory === 'regular' && regularClassDatesSoFar.includes(dateKey);
      })
      .map((record) => `${record.memberId?._id}-${record.date?.slice(0, 10)}`)
  );

  const missedMembers = totalRegularClassesSoFar > 0
    ? regularMembers
        .map((member) => {
          const attendedCount = regularClassDatesSoFar.reduce((count, date) => {
            return presentLookup.has(`${member._id}-${date}`) ? count + 1 : count;
          }, 0);

          const missedCount = totalRegularClassesSoFar - attendedCount;
          return {
            ...member,
            attendedCount,
            missedCount,
            missedRate: ((missedCount / totalRegularClassesSoFar) * 100).toFixed(0)
          };
        })
        .filter((member) => member.missedCount > 0)
        .sort((a, b) => b.missedCount - a.missedCount || a.name.localeCompare(b.name))
    : [];

  const getMissedRowClass = (missedCount) => {
    if (totalRegularClassesSoFar === 0) return '';
    if (missedCount > totalRegularClassesSoFar / 2) return 'missed-row-danger';
    if (missedCount * 2 === totalRegularClassesSoFar) return 'missed-row-warning';
    return '';
  };

  const filteredMissedMembers = missedMembers.filter((member) => {
    // Gender filter
    if (missedGenderFilter !== 'all' && member.gender !== missedGenderFilter) {
      return false;
    }
    
    // Color filter
    if (missedColorFilter !== 'all') {
      const rowClass = getMissedRowClass(member.missedCount);
      if (missedColorFilter === 'yellow' && rowClass !== 'missed-row-warning') {
        return false;
      }
      if (missedColorFilter === 'red' && rowClass !== 'missed-row-danger') {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center">
          <h2>Dashboard Overview</h2>
          <div className="flex gap-1 items-center">
            <label htmlFor="sunday-select" style={{ marginRight: '0.5rem', fontWeight: '500' }}>
              Time Period:
            </label>
            <select
              id="sunday-select"
              className="form-control"
              value={selectedSunday}
              onChange={(e) => setSelectedSunday(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="semester">Full Semester</option>
              {semesterSundays.map((sunday) => (
                <option key={sunday.date} value={sunday.date}>
                  {sunday.label}
                </option>
              ))}
            </select>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={fetchData}
              disabled={loading}
              style={{ marginLeft: '0.5rem' }}
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
            {sheetsConfigured && (
              <button 
                className="btn btn-success btn-sm" 
                onClick={handleExportToSheets}
                disabled={exporting}
                style={{ marginLeft: '0.5rem' }}
              >
                {exporting ? '⏳ Exporting...' : '📊 Export to Google Sheets'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sunday School Resources */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>📚 Sunday School Resources</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          {/* General Handbook */}
          <a 
            href="https://www.churchofjesuschrist.org/study/manual/general-handbook/13-sunday-school?lang=eng"
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/7/77/General_Handbook%2C_Serving_in_The_Church_of_Jesus_Christ_of_Latter-day_Saints.png"
              alt="General Handbook"
              style={{ 
                width: '150px', 
                height: '200px', 
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1rem', fontWeight: '600' }}>
              General Handbook
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
              Sunday School Guidelines
            </p>
          </a>

          {/* Come Follow Me */}
          <a 
            href={`https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-home-and-church-old-testament-2026/${getCurrentLessonNumber().toString().padStart(2, '0')}?lang=eng`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img 
              src="https://images-us-prod.cms.commerce.dynamics.com/cms/api/fswvqbgntk/imageFileData/search?fileName=/Products%2FPI85125483_000_001.png"
              alt="Come Follow Me"
              style={{ 
                width: '150px', 
                height: '200px', 
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1rem', fontWeight: '600' }}>
              Come, Follow Me
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
              {getCurrentWeekLabel()} · Old Testament 2026
            </p>
          </a>

        </div>
      </div>

      {!hasData ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Data to Display</h3>
          <p style={{ color: '#666', marginTop: '1rem' }}>
            No attendance records have been saved yet. Go to Attendance Tracking to record attendance.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Members</h3>
              <div className="stat-value">{stats.totalMembers}</div>
              <div className="stat-label">
                {stats.maleMembers} Men • {stats.femaleMembers} Women
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Overall Attendance Rate</h3>
              <div className="stat-value">{attendanceRate}%</div>
              <div className="stat-label">
                {stats.presentCount} of {stats.totalAttendanceRecords} records
                {stats.datesIncluded > 0 && ` (${stats.datesIncluded} ${stats.datesIncluded === 1 ? 'Sunday' : 'Sundays'})`}
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Assignment Completion</h3>
              <div className="stat-value">{assignmentRate}%</div>
              <div className="stat-label">
                {stats.readAssignmentCount} members read assignments
              </div>
            </div>
        
        <div className="stat-card">
          <h3>Temple Prep Attendance</h3>
          <div className="stat-value">
            {stats.templePrepMembers > 0 
              ? ((stats.templePrepAttendance / (stats.templePrepMembers * (stats.templePrepWeeks || 1))) * 100).toFixed(0)
              : 0}%
          </div>
          <div className="stat-label">
            {stats.templePrepAttendance} of {stats.templePrepMembers * (stats.templePrepWeeks || 1)} total slots
            {stats.templePrepWeeks > 0 && ` (${stats.templePrepWeeks} ${stats.templePrepWeeks === 1 ? 'week' : 'weeks'})`}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Mission Prep Attendance</h3>
          <div className="stat-value">
            {stats.missionPrepMembers > 0 
              ? ((stats.missionPrepAttendance / (stats.missionPrepMembers * (stats.missionPrepWeeks || 1))) * 100).toFixed(0)
              : 0}%
          </div>
          <div className="stat-label">
            {stats.missionPrepAttendance} of {stats.missionPrepMembers * (stats.missionPrepWeeks || 1)} total slots
            {stats.missionPrepWeeks > 0 && ` (${stats.missionPrepWeeks} ${stats.missionPrepWeeks === 1 ? 'week' : 'weeks'})`}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
        
        {/* Gender Attendance Bar Chart */}
        <div className="chart-container">
          <h3 className="chart-title">👨👩 Attendance by Gender</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attended" fill="#2563eb" name="Attended" />
              <Bar dataKey="total" fill="#cbd5e1" name="Total Members" />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center mt-1">
            <small>Men: {genderAttendanceData[0].percentage}% • Women: {genderAttendanceData[1].percentage}%</small>
          </div>
        </div>

        {/* Overall Attendance Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">📊 Overall Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overallData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {overallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assignment Reading Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">📖 Assignment Reading Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assignmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assignmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index + 2 % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Attendance Bar Chart */}
        <div className="chart-container">
          <h3 className="chart-title">🏛️📖 Preparation Classes Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10b981" name="Attended" />
              <Bar dataKey="total" fill="#cbd5e1" name="Total Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>⚠️ Members Missing Sunday School Classes</h3>
        {totalRegularClassesSoFar === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>
            No regular Sunday classes have happened yet.
          </p>
        ) : missedMembers.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>
            Great news! No regular members have missed class so far.
          </p>
        ) : (
          <>
            <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
              Based on {totalRegularClassesSoFar} regular {totalRegularClassesSoFar === 1 ? 'class' : 'classes'} held so far.
            </p>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div>
                <label htmlFor="gender-filter" style={{ marginRight: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                  Gender:
                </label>
                <select
                  id="gender-filter"
                  className="form-control"
                  value={missedGenderFilter}
                  onChange={(e) => setMissedGenderFilter(e.target.value)}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="color-filter" style={{ marginRight: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                  Risk Level:
                </label>
                <select
                  id="color-filter"
                  className="form-control"
                  value={missedColorFilter}
                  onChange={(e) => setMissedColorFilter(e.target.value)}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="all">All</option>
                  <option value="yellow">⚠️ Yellow (Half)</option>
                  <option value="red">🔴 Red (More than half)</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Missed</th>
                    <th>Attended</th>
                    <th>Missed %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMissedMembers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>
                        No members match the selected filters
                      </td>
                    </tr>
                  ) : (
                    filteredMissedMembers.map((member) => (
                      <tr key={member._id} className={getMissedRowClass(member.missedCount)}>
                        <td>{member.name}</td>
                        <td>{member.gender === 'male' ? '👨 Male' : '👩 Female'}</td>
                        <td>{member.missedCount} / {totalRegularClassesSoFar}</td>
                        <td>{member.attendedCount} / {totalRegularClassesSoFar}</td>
                        <td>{member.missedRate}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Yellow: missed exactly half of regular classes • Red: missed more than half.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
