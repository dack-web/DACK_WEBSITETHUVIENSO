import React, { useState, useEffect } from 'react';
import './MembersInventory.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const MembersInventory = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        department: '',
        student_id: ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                setLoading(false);
                return;
            }

            const response = await fetch(`${BACKEND_URL}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 401) {
                console.error('Unauthorized! Token might be expired or invalid.');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setMembers(data.data);
            } else {
                console.error('API Error:', data.message);
            }
        } catch (error) {
            console.error('Fetch members network error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const url = editingMember 
                ? `${BACKEND_URL}/members/${editingMember.id}`
                : `${BACKEND_URL}/members`;
            
            const method = editingMember ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (data.success) {
                setShowModal(false);
                setEditingMember(null);
                setFormData({ name: '', email: '', password: '', phone: '', address: '', department: '', student_id: '' });
                fetchMembers();
                alert(data.message);
            } else {
                alert(data.message || 'Error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
                const response = await fetch(`${BACKEND_URL}/members/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    fetchMembers();
                    alert('Member deleted successfully');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Delete failed');
            }
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name || '',
            email: member.email || '',
            password: '',
            phone: member.phone || '',
            address: member.address || '',
            department: member.department || '',
            student_id: member.student_id || ''
        });
        setShowModal(true);
    };

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading members...</div>;

    return (
        <div className="members-container">
            <div className="members-header">
                <div>
                    <h1>Members Management</h1>
                    <p>Manage library members and their accounts</p>
                </div>
                <button className="add-btn" onClick={() => { 
                    setEditingMember(null); 
                    setFormData({ name: '', email: '', password: '', phone: '', address: '', department: '', student_id: '' }); 
                    setShowModal(true); 
                }}>
                    <i className="fa-solid fa-plus"></i> Add Member
                </button>
            </div>

            <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input
                    type="text"
                    placeholder="Search by name, email or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="members-table-wrapper">
                <table className="members-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Student ID</th>
                            <th>Member Since</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id}>
                                <td>{member.id}</td>
                                <td><strong>{member.name}</strong></td>
                                <td>{member.email}</td>
                                <td>{member.phone || '-'}</td>
                                <td>{member.department || '-'}</td>
                                <td>{member.student_id || '-'}</td>
                                <td>{new Date(member.created_at).toLocaleDateString()}</td>
                                <td className="actions">
                                    <button className="edit-btn" onClick={() => handleEdit(member)}>
                                        <i className="fa-solid fa-edit"></i>
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(member.id)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                            <tr>
                                <td colSpan="8" className="no-data">No members found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                    required 
                                />
                            </div>
                            {!editingMember && (
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input 
                                        type="password" 
                                        value={formData.password} 
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                        required 
                                    />
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone} 
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input 
                                        type="text" 
                                        value={formData.department} 
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                    rows="2"
                                />
                            </div>
                            <div className="form-group">
                                <label>Student/Staff ID</label>
                                <input 
                                    type="text" 
                                    value={formData.student_id} 
                                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">{editingMember ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersInventory;