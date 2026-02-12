import React, { useEffect, useState } from 'react';
import { membersAPI } from '../services/api';

const PrepManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    category: 'temple-prep',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data);
    } catch (e) {
      showMessage('error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', gender: 'male', category: 'temple-prep', email: '', phone: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingId) {
        await membersAPI.update(editingId, payload);
        showMessage('success', 'Member updated successfully');
      } else {
        await membersAPI.create(payload);
        showMessage('success', 'Member added successfully');
      }
      resetForm();
      fetchMembers();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      gender: member.gender,
      category: member.category,
      email: member.email || '',
      phone: member.phone || ''
    });
    setEditingId(member._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await membersAPI.delete(id);
      showMessage('success', 'Member deleted successfully');
      fetchMembers();
    } catch (error) {
      showMessage('error', 'Failed to delete member');
    }
  };

  const prepMembers = members.filter(m => m.category === 'temple-prep' || m.category === 'mission-prep');

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card" style={{ background: '#f0f9ff', borderLeft: '4px solid #2563eb' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>📅 Preparation Class Schedules</h3>
        <p style={{ margin: '0.25rem 0', color: '#374151' }}>
          <strong>🏛️ Temple Prep:</strong> 5 weeks (Feb 15, 22, Mar 1, 8, 15, 2026)
        </p>
        <p style={{ margin: '0.25rem 0', color: '#374151' }}>
          <strong>📖 Mission Prep:</strong> 8 weeks (every Sunday from Feb 15 - Apr 5, 2026)
        </p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h2>Temple/Mission Prep Members ({prepMembers.length})</h2>
          <div className="flex gap-1">
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Add Prep Member'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ background: '#f9fafb' }}>
            <h3>{editingId ? 'Edit Prep Member' : 'Add New Prep Member'}</h3>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select
                className="form-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Program *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="temple-prep">Temple Prep</option>
                <option value="mission-prep">Mission Prep</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-1">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update' : 'Add'} Member
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Program</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prepMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No prep members found. Add some above.</td>
                </tr>
              ) : (
                prepMembers.map((member) => (
                  <tr key={member._id}>
                    <td>{member.name}</td>
                    <td>{member.gender === 'male' ? '👨 Male' : '👩 Female'}</td>
                    <td>
                      {member.category === 'temple-prep' ? '🏛️ Temple Prep' : '📖 Mission Prep'}
                    </td>
                    <td>{member.email || '-'}</td>
                    <td>{member.phone || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm" onClick={() => handleEdit(member)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(member._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrepManagement;
