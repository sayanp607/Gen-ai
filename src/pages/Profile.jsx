import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import { API_BASE_URL } from '../config';
const Profile = () => {
  const [links, setLinks] = useState([]);
  const [editName, setEditName] = useState({});

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_BASE_URL}/api/links/my-links`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinks(res.data.savedLinks);
    } catch (err) {
      console.error('Error fetching links', err);
      toast.error('❌ Failed to fetch saved links.');
    }
  };

  const handleDelete = async (id) => {
    const token = getToken();
    try {
      await axios.delete(`${API_BASE_URL}/api/links/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Link deleted successfully!');
      fetchLinks();
    } catch (err) {
      console.error('Failed to delete', err);
      toast.error('❌ Could not delete the link.');
    }
  };

  const handleEdit = async (id) => {
    const token = getToken();
    try {
      await axios.put(
        `${API_BASE_URL}/api/links/edit/${id}`,
        { name: editName[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✏️ Name updated successfully!');
      fetchLinks();
    } catch (err) {
      console.error('Failed to update', err);
      toast.error('❌ Could not update the link name.');
    }
  };

  return (
    <div className="profile-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2>📚 My Saved Links</h2>
      {links.length === 0 && <p>No saved links yet.</p>}
      {links.map((link) => (
        <div key={link._id} className="link-card">
          <p><strong>Name:</strong> {link.name || 'Unnamed'}</p>
          <p><strong>Saved On:</strong> {new Date(link.createdAt).toLocaleString()}</p>
          <p>
            <strong>URL:</strong>{' '}
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.url}
            </a>
          </p>

          <input
            type="text"
            placeholder="Edit name"
            value={editName[link._id] || ''}
            onChange={(e) => setEditName({ ...editName, [link._id]: e.target.value })}
          />
          <button onClick={() => handleEdit(link._id)}>✏️ Save Name</button>
          <button onClick={() => handleDelete(link._id)}>🗑️ Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Profile;
