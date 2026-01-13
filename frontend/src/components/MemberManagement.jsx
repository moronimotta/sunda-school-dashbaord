import React, { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    category: 'regular',
    email: '',
    phone: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await membersAPI.update(editingId, formData);
        showMessage('success', 'Member updated successfully');
      } else {
        await membersAPI.create(formData);
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

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL members? This cannot be undone!')) return;
    
    try {
      await membersAPI.deleteAll();
      showMessage('success', 'All members deleted successfully');
      fetchMembers();
    } catch (error) {
      showMessage('error', 'Failed to delete members');
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await membersAPI.uploadPDF(file);
      showMessage('success', response.data.message);
      fetchMembers();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleAIUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAiLoading(true);
      const response = await membersAPI.uploadAI(file);
      showMessage('success', response.data.message || 'Imported members with Gemini AI');
      fetchMembers();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to analyze file with Gemini');
    } finally {
      setAiLoading(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'male',
      category: 'regular',
      email: '',
      phone: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h2>Members ({members.length})</h2>
          <div className="flex gap-1">
            <div className="file-upload" style={{ display: 'inline-block', padding: '0', border: 'none' }}>
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                onChange={handlePDFUpload}
              />
              <label htmlFor="pdf-upload" className="btn btn-secondary btn-sm">
                📄 Upload PDF
              </label>
            </div>
            <div className="file-upload" style={{ display: 'inline-block', padding: '0', border: 'none' }}>
              <input
                type="file"
                id="ai-upload"
                accept=".pdf,.txt,.csv"
                onChange={handleAIUpload}
                disabled={aiLoading}
              />
              <label htmlFor="ai-upload" className="btn btn-success btn-sm">
                {aiLoading ? '🤖 Analyzing…' : '🤖 AI Import (Gemini)'}
              </label>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ Add Member'}
            </button>
            {members.length > 0 && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleDeleteAll}
              >
                🗑️ Delete All
              </button>
            )}
          </div>
        </div>
        <p style={{ marginTop: 0, color: '#475467', fontSize: '0.9rem' }}>
          Use AI Import to drop a PDF, TXT, or CSV roster and let Gemini structure the members automatically.
        </p>

        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ background: '#f9fafb' }}>
            <h3>{editingId ? 'Edit Member' : 'Add New Member'}</h3>
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
              <label>Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="regular">Regular</option>
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
                <th>Category</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No members found. Add members or upload a PDF.</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member._id}>
                    <td>{member.name}</td>
                    <td>{member.gender === 'male' ? '👨 Male' : '👩 Female'}</td>
                    <td>
                      {member.category === 'temple-prep' ? '🏛️ Temple Prep' :
                       member.category === 'mission-prep' ? '📖 Mission Prep' : 
                       '📚 Regular'}
                    </td>
                    <td>{member.email || '-'}</td>
                    <td>{member.phone || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(member)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(member._id)}
                        >
                          Delete
                        </button>
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

export default MemberManagement;
