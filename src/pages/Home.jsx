import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PreviewFrame from '../components/PreviewFrame';
import AuthModal from '../components/AuthModal'; 
import { isLoggedIn, getToken, logout } from '../utils/auth';
import './Home.css';
import { API_BASE_URL } from '../config';
const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [tab, setTab] = useState('preview');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHtml, setOriginalHtml] = useState('');
  const [originalCss, setOriginalCss] = useState('');
  const [originalJs, setOriginalJs] = useState('');
  const [publishUrl, setPublishUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      setShowAuthModal(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('🔒 You have been logged out.');
    navigate('/');
    window.location.reload();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.warn('⚠️ Please enter a prompt first.');
      return;
    }

    if (!isLoggedIn()) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/generate`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const code = res.data.code;
      setGeneratedCode(code);
      parseCode(code);
      setTab('preview');
    } catch (err) {
      console.error('Error:', err);
      toast.error('🚫 Failed to generate website');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishUrl('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/deploy/publish`,
        { html, css, js },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 && res.data.url) {
        setPublishUrl(res.data.url);
        setShowLinkModal(true);
      } else {
        toast.info(res.data.message || 'Site still deploying. Try again shortly.');
      }
    } catch (err) {
      console.error(err);
      toast.error('🚫 Failed to publish site.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveLink = async () => {
    const token = getToken();
    if (!token) {
      toast.warn('⚠️ You must be logged in to save.');
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/links/save`,
        { url: publishUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('✅ Link saved to your profile!');
        setShowPublishModal(false);
      } else {
        toast.info('ℹ️ ' + (res.data.message || 'Link already saved.'));
      }
    } catch (err) {
      console.error('Error saving link:', err);
      toast.error('🚫 Failed to save link.');
    }
  };

  const parseCode = (raw) => {
    const htmlMatch = raw.match(/```html\s*([\s\S]*?)```/i);
    const cssMatch = raw.match(/```css\s*([\s\S]*?)```/i);
    const jsMatch = raw.match(/```(?:js|javascript)\s*([\s\S]*?)```/i);

    const extractBodyContent = (htmlString) => {
      const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) return bodyMatch[1].trim();
      return htmlString
        .replace(/<!DOCTYPE[^>]*>/i, '')
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '')
        .trim();
    };

    const html = htmlMatch ? extractBodyContent(htmlMatch[1].trim()) : extractBodyContent(raw.trim());
    const css = cssMatch ? cssMatch[1].trim() : (raw.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1].trim() || '');
    const js = jsMatch ? jsMatch[1].trim() : (raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1].trim() || '');

    setHtml(html);
    setCss(css);
    setJs(js);
    setOriginalHtml(html);
    setOriginalCss(css);
    setOriginalJs(js);
  };

  const Loader = () => (
    <div className="loader">
      <div className="spinner" />
      <p className="loading-text">Generating your website... Please wait a few seconds</p>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Header */}
      <div className="header-bar">
        <div className="header-right">
          {isLoggedIn() ? (
            <button onClick={handleLogout} className="logout-btn">🔒 Logout</button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="login-btn">🔐 Login</button>
          )}
        </div>
        <div className="header-left">
          <Link to="/profile" className="profile-link">🔗 My Profile</Link>
        </div>
      </div>

      {/* Main Generator UI */}
      <div className="home-container">
        <h1>✨ GenAI Website Builder</h1>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your website idea..."
          className="prompt-input"
        />
        <button onClick={handleGenerate} className="generate-btn">Generate</button>

        {generatedCode && (
          <>
            <div className="tab-buttons">
              <button onClick={() => setTab('preview')}>Live Preview</button>
              <button onClick={() => setTab('code')}>Code View</button>
              {tab === 'code' && (
                <>
                  <button onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'edit-btn-active' : 'edit-btn'}>
                    {isEditing ? 'Apply Code' : 'Edit Code'}
                  </button>
                  <button onClick={() => {
                    setHtml(originalHtml);
                    setCss(originalCss);
                    setJs(originalJs);
                  }} className="undo-btn">Undo</button>
                </>
              )}
            </div>

            {tab === 'preview' ? (
              html ? (
                <PreviewFrame code={`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`} />
              ) : (
                <p className="error-msg">⚠️ Could not generate a preview. Try again or adjust your prompt.</p>
              )
            ) : (
              <div className="code-editor">
                <h3>HTML CODE</h3>
                <textarea value={html} onChange={(e) => setHtml(e.target.value)} disabled={!isEditing} />
                <h3>CSS CODE</h3>
                <textarea value={css} onChange={(e) => setCss(e.target.value)} disabled={!isEditing} />
                <h3>JAVASCRIPT CODE</h3>
                <textarea value={js} onChange={(e) => setJs(e.target.value)} disabled={!isEditing} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Loaders / Modals */}
      {isLoading && <Loader />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={() => setShowAuthModal(false)} />}

      {html && (
        <div className="publish-section">
          <button className="publish-btn" onClick={handlePublish}>
            {isPublishing ? '🚀 Publishing...' : '🌐 Publish'}
          </button>
          {publishUrl && (
            <div className="publish-url">
              ✅ Live Site:&nbsp;<a href={publishUrl} target="_blank" rel="noopener noreferrer">{publishUrl}</a>
            </div>
          )}
        </div>
      )}

      {showLinkModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>✅ Website Published</h3>
            <p><a href={publishUrl} target="_blank" rel="noopener noreferrer">{publishUrl}</a></p>
            <button className="save-btn" onClick={handleSaveLink}>💾 Save to Profile</button>
            <button className="close-btn" onClick={() => setShowLinkModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
