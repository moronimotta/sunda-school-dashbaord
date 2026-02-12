import React, { useState, useEffect } from 'react';
import { membersAPI, attendanceAPI, exportAPI } from '../services/api';
import { format } from 'date-fns';

const AttendanceTracking = () => {
  // Spring 2026 Semester dates:
  // Regular Sunday School: Jan 18, Feb 1, Feb 15, Mar 1, Mar 15, Apr 5 (first and third Sundays)
  // Temple Prep (5 weeks): Feb 15, 22, Mar 1, 8, 15
  // Mission Prep (8 weeks): Feb 15, 22, Mar 1, 8, 15, 22, 29, Apr 5
  
  const regularDates = ['2026-01-18', '2026-02-01', '2026-02-15', '2026-03-01', '2026-03-15', '2026-04-05'];
  const templePrepDates = ['2026-02-15', '2026-02-22', '2026-03-01', '2026-03-08', '2026-03-15'];
  const missionPrepDates = ['2026-02-15', '2026-02-22', '2026-03-01', '2026-03-08', '2026-03-15', '2026-03-22', '2026-03-29', '2026-04-05'];
  
  // Combined unique dates sorted:
  const attendanceDates = [
    '2026-01-18', // Regular only
    '2026-02-01', // Regular only
    '2026-02-15', // Regular + Temple Prep + Mission Prep
    '2026-02-22', // Temple Prep + Mission Prep
    '2026-03-01', // Regular + Temple Prep + Mission Prep
    '2026-03-08', // Temple Prep + Mission Prep
    '2026-03-15', // Regular + Temple Prep + Mission Prep
    '2026-03-22', // Mission Prep only
    '2026-03-29', // Mission Prep only
    '2026-04-05'  // Regular + Mission Prep
  ];

  const defaultDate = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    // Find most recent Sunday on or before today
    const past = attendanceDates.filter((d) => d <= todayStr);
    if (past.length > 0) return past[past.length - 1];
    // Otherwise use first available date
    return attendanceDates[0];
  };

  const [members, setMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [exporting, setExporting] = useState(false);
  const [sheetsConfigured, setSheetsConfigured] = useState(false);

  useEffect(() => {
    checkSheetsStatus();
  }, []);
  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, members]);

  const checkSheetsStatus = async () => {
    try {
      const response = await exportAPI.getStatus();
      setSheetsConfigured(response.data.configured);
    } catch (error) {
      console.error('Error checking Google Sheets status:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      // start with defaults (all members absent/unchecked)
      const defaults = members.reduce((acc, m) => {
        acc[m._id] = { present: false, readAssignment: false };
        return acc;
      }, {});

      const response = await attendanceAPI.getByDate(selectedDate);
      response.data.forEach(record => {
        defaults[record.memberId._id] = {
          present: record.present,
          readAssignment: record.readAssignment
        };
      });
      setAttendanceRecords(defaults);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleAttendanceChange = (memberId, field, value) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const records = members.map((m) => ({
        memberId: m._id,
        present: attendanceRecords[m._id]?.present || false,
        readAssignment: attendanceRecords[m._id]?.readAssignment || false
      }));

      await attendanceAPI.bulkCreate(selectedDate, records);
      showMessage('success', 'Attendance saved successfully');
    } catch (error) {
      showMessage('error', 'Failed to save attendance');
    }
  };

  const handleExportToSheets = async () => {
    if (!sheetsConfigured) {
      showMessage('error', 'Google Sheets is not configured. Please set up credentials in the backend.');
      return;
    }

    try {
      setExporting(true);
      const response = await exportAPI.exportDate(selectedDate);
      
      if (response.data.success) {
        showMessage('success', 'Exported to Google Sheets successfully!');
        // Open the spreadsheet in a new tab
        window.open(response.data.spreadsheetUrl, '_blank');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to export to Google Sheets');
    } finally {
      setExporting(false);
    }
  };

  const getSundayDates = () => attendanceDates;

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (members.length === 0) {
    return (
      <div className="card">
        <h2>No Members Found</h2>
        <p>Please add members first before tracking attendance.</p>
      </div>
    );
  }

  const regularMembers = members.filter(m => m.category === 'regular');
  const templePrepMembers = members.filter(m => m.category === 'temple-prep');
  const missionPrepMembers = members.filter(m => m.category === 'mission-prep');
  
  // Determine which classes meet on the selected date
  const hasRegularClass = regularDates.includes(selectedDate);
  const hasTemplePrepClass = templePrepDates.includes(selectedDate);
  const hasMissionPrepClass = missionPrepDates.includes(selectedDate);
  
  // Build class info message
  const getClassInfo = () => {
    const classes = [];
    if (hasRegularClass) classes.push('📚 Regular Sunday School');
    if (hasTemplePrepClass) classes.push('🏛️ Temple Prep');
    if (hasMissionPrepClass) classes.push('📖 Mission Prep');
    return classes.length > 0 ? classes.join(' • ') : 'No classes scheduled';
  };

  const AttendanceTable = ({ membersList, title }) => (
    <div className="card">
      <h3>{title}</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th style={{ textAlign: 'center' }}>Present</th>
              <th style={{ textAlign: 'center' }}>Read Assignment</th>
            </tr>
          </thead>
          <tbody>
            {membersList.map((member) => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.gender === 'male' ? '👨 Male' : '👩 Female'}</td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={attendanceRecords[member._id]?.present || false}
                    onChange={(e) => handleAttendanceChange(member._id, 'present', e.target.checked)}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={attendanceRecords[member._id]?.readAssignment || false}
                    onChange={(e) => handleAttendanceChange(member._id, 'readAssignment', e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h2>Attendance Tracking</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
              Classes today: {getClassInfo()}
            </p>
          </div>
          <div className="flex gap-1 items-center">
            <label htmlFor="date-select" style={{ marginRight: '0.5rem', fontWeight: '500' }}>
              Select Date:
            </label>
            <select
              id="date-select"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto' }}
            >
              {getSundayDates().map(date => {
                // Parse date string as local date to avoid timezone issues
                const [year, month, day] = date.split('-');
                const localDate = new Date(year, month - 1, day);
                return (
                  <option key={date} value={date}>
                    {format(localDate, 'MMMM d, yyyy')}
                  </option>
                );
              })}
            </select>
            <button className="btn btn-success" onClick={handleSave}>
              💾 Save Attendance
            </button>
          </div>
          {sheetsConfigured && (
            <button 
              className="btn btn-primary" 
              onClick={handleExportToSheets}
              disabled={exporting}
            >
              {exporting ? '⏳ Exporting...' : '📊 Export to Google Sheets'}
            </button>
          )}
        </div>
      </div>

      {hasRegularClass && regularMembers.length > 0 && (
        <AttendanceTable 
          membersList={regularMembers} 
          title="📚 Regular Sunday School" 
        />
      )}

      {hasTemplePrepClass && templePrepMembers.length > 0 && (
        <AttendanceTable 
          membersList={templePrepMembers} 
          title="🏛️ Temple Preparation" 
        />
      )}

      {hasMissionPrepClass && missionPrepMembers.length > 0 && (
        <AttendanceTable 
          membersList={missionPrepMembers} 
          title="📖 Mission Preparation" 
        />
      )}
      
      {!hasRegularClass && !hasTemplePrepClass && !hasMissionPrepClass && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', background: '#f9fafb' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>No classes are scheduled for this date.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
