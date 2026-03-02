import React, { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const payload = { ...formData, category: 'regular' };
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
      category: 'regular',
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

  const handleExportNames = () => {
    if (members.length === 0) {
      showMessage('error', 'No members to export');
      return;
    }

    // Get all member names (filter for regular members to match the table display)
    const memberNames = members
      .filter(m => m.category === 'regular')
      .map(member => member.name)
      .join('\n');

    // Create a blob with the text content
    const blob = new Blob([memberNames], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `sunday-school-members-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showMessage('success', `Exported ${members.filter(m => m.category === 'regular').length} member names to text file`);
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
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ Add Member'}
            </button>
            {members.length > 0 && (
              <>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={handleExportNames}
                >
                  📄 Export Names
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteAll}
                >
                  🗑️ Delete All
                </button>
              </>
            )}
          </div>
        </div>

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
            {/* Regular members tab: category is fixed to Regular */}
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
              {members.filter(m => m.category === 'regular').length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No members found. Add members or upload a PDF.</td>
                </tr>
              ) : (
                members.filter(member => member.category === 'regular').map((member) => (
                  <tr key={member._id}>
                    <td>{member.name}</td>
                    <td>{member.gender === 'male' ? '👨 Male' : '👩 Female'}</td>
                    <td>
                      📚 Regular
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
