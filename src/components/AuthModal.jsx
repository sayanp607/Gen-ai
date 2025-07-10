import React, { useState } from 'react';
import axios from 'axios';
import { saveToken } from '../utils/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config'; // ✅ Added
import './AuthModal.css';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin
      ? `${API_BASE_URL}/api/auth/login`
      : `${API_BASE_URL}/api/auth/register`;

    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await axios.post(endpoint, payload);

      if (isLogin && res.data.token) {
        saveToken(res.data.token);
        toast.success('✅ Login successful!');
        onAuthSuccess();
        onClose();
      } else if (!isLogin) {
        toast.success('✅ Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong';
      toast.error(`❌ ${message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="modal-box">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p style={{ marginTop: '10px' }}>
          {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
          <button className="link-button" type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register here' : 'Login'}
          </button>
        </p>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default AuthModal;
