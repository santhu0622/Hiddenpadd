import React, { useState } from 'react';
import Homepage from './components/Homepage';
import SearchEditor from './components/SearchEditor';
import StickyEditor from './components/StickyEditor';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'search_editor' | 'sticky_editor'
  const [activeDoc, setActiveDoc] = useState({
    key: '',
    content: '',
    isSticky: false,
    exists: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch document by key from API
  const fetchDoc = async (key) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const normKey = key.trim().toLowerCase();
      const res = await fetch(`/api/docs/${encodeURIComponent(normKey)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch document');
      }
      const data = await res.json();
      setActiveDoc({
        key: data.key,
        content: data.content || '',
        isSticky: Boolean(data.isSticky),
        exists: Boolean(data.exists),
      });
      return data;
    } catch (err) {
      console.error('API Error:', err);
      // Fallback local memory state in case backend is offline
      setActiveDoc({
        key: key.trim().toLowerCase(),
        content: '',
        isSticky: false,
        exists: false,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save / Stick document API
  const saveDoc = async (content, makeSticky = false) => {
    try {
      const res = await fetch(`/api/docs/${encodeURIComponent(activeDoc.key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isSticky: makeSticky }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save document');
      }

      const data = await res.json();
      setActiveDoc((prev) => ({
        ...prev,
        content: data.content,
        isSticky: Boolean(data.isSticky),
        exists: true,
      }));
      return true;
    } catch (err) {
      console.error('Save Error:', err);
      setErrorMsg(err.message);
      return false;
    }
  };

  // Homepage Search trigger
  const handleSearch = async (key) => {
    const docData = await fetchDoc(key);
    setCurrentView('search_editor');
  };

  // Homepage Sticky Search trigger
  const handleStickySearch = async (key) => {
    const docData = await fetchDoc(key);
    setCurrentView('sticky_editor');
  };

  // Exit back to Homepage
  const handleExit = () => {
    setActiveDoc({ key: '', content: '', isSticky: false, exists: false });
    setErrorMsg('');
    setCurrentView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-[#dddddd] flex flex-col items-center justify-center font-mono">
        <h1 className="text-xl font-bold tracking-wider mb-4">HIDDEN PAD</h1>
        <p className="text-sm text-[#888888]">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      {errorMsg && (
        <div className="bg-[#2a2a2a] text-[#dddddd] text-xs px-4 py-2 text-center font-mono border-b border-[#3a3a3a]">
          {errorMsg}
        </div>
      )}

      {currentView === 'home' && (
        <Homepage
          onSearch={handleSearch}
          onStickySearch={handleStickySearch}
        />
      )}

      {currentView === 'search_editor' && (
        <SearchEditor
          docKey={activeDoc.key}
          initialContent={activeDoc.content}
          isSticky={activeDoc.isSticky}
          onSave={(content, isSticky) => saveDoc(content, isSticky)}
          onExit={handleExit}
        />
      )}

      {currentView === 'sticky_editor' && (
        <StickyEditor
          docKey={activeDoc.key}
          initialContent={activeDoc.content}
          isSticky={activeDoc.isSticky}
          onStick={(content) => saveDoc(content, true)}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
