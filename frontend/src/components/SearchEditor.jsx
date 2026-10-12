import React, { useState, useEffect } from 'react';

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0 }}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function SearchEditor({ docKey, initialContent, isSticky, onSave, onExit }) {
  const [content, setContent] = useState(initialContent || '');
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [saveStatus, setSaveStatus] = useState('');

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!isSticky) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, isSticky]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleSave = async () => {
    setSaveStatus('Saving...');
    const success = await onSave(content, false);
    if (success) {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } else {
      setSaveStatus('Error saving');
    }
  };

  const handleSaveAndExit = async () => {
    setSaveStatus('Saving...');
    const success = await onSave(content, false);
    if (success) {
      onExit();
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#dddddd] flex flex-col items-center pt-8 pb-12 px-4 font-mono">
      {/* Top Center Title */}
      <h1 className="text-xl font-bold tracking-widest mb-6 text-[#eeeeee] uppercase" style={{ fontFamily: 'Space Mono, monospace' }}>
        STICKY PAD
      </h1>

      <div className="w-full max-w-4xl flex flex-col gap-4 flex-1">
        {/* Editor Container */}
        <div className="relative border border-[#2a2a2a] bg-[#1a1a1a] rounded-[6px] flex flex-col p-2">
          {/* Top-Right Copy Button */}
          <div className="flex justify-between items-center px-3 py-1 text-xs border-b border-[#2a2a2a] mb-2">
            <span className="text-[#888888]">SEARCH KEY: <strong className="text-[#dddddd]">{docKey}</strong></span>
            <button
              type="button"
              id="btn-copy"
              onClick={handleCopy}
              className="text-[#dddddd] hover:text-white flex items-center gap-1.5 cursor-pointer select-none text-xs"
            >
              <CopyIcon /> {copyStatus}
            </button>
          </div>

          {/* Main Text Area */}
          <textarea
            id="search-editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={isSticky}
            placeholder="Type code, notes, passwords, logs..."
            className="hp-textarea border-none bg-transparent min-h-[500px] h-[65vh] p-3 text-sm focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Action Buttons Below Editor */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-3">
            <button
              type="button"
              id="btn-save"
              onClick={handleSave}
              disabled={isSticky}
              className={`hp-button ${isSticky ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Save
            </button>

            <button
              type="button"
              id="btn-exit"
              onClick={onExit}
              className="hp-button"
            >
              Exit
            </button>

            <button
              type="button"
              id="btn-save-exit"
              onClick={handleSaveAndExit}
              disabled={isSticky}
              className={`hp-button ${isSticky ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Save & Exit
            </button>
          </div>

          {saveStatus && (
            <span className="text-xs text-[#888888] font-mono">{saveStatus}</span>
          )}
        </div>
      </div>
    </div>
  );
}
