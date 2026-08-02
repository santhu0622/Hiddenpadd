import React, { useState } from 'react';

export default function StickyEditor({ docKey, initialContent, isSticky: initialIsSticky, onStick, onExit }) {
  const [content, setContent] = useState(initialContent || '');
  const [isSticky, setIsSticky] = useState(initialIsSticky || false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [statusMsg, setStatusMsg] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleStick = async () => {
    if (isSticky) return;
    setStatusMsg('Sticking...');
    const success = await onStick(content);
    if (success) {
      setIsSticky(true);
      setStatusMsg('Stuck (Read-Only)');
    } else {
      setStatusMsg('Error sticking');
    }
  };

  const handleStickAndExit = async () => {
    if (isSticky) {
      onExit();
      return;
    }
    setStatusMsg('Sticking...');
    const success = await onStick(content);
    if (success) {
      onExit();
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#dddddd] flex flex-col items-center pt-8 pb-12 px-4">
      {/* Top Center Title */}
      <h1 className="text-xl font-bold tracking-wider mb-6 text-[#dddddd]">
        HIDDEN PAD
      </h1>

      <div className="w-full max-w-4xl flex flex-col gap-4 flex-1">
        {/* Sticky Editor Container */}
        <div className="relative border border-[#2a2a2a] bg-[#1a1a1a] rounded-[6px] flex flex-col p-2">
          {/* Top-Right Copy Button */}
          <div className="flex justify-between items-center px-3 py-1 text-xs border-b border-[#2a2a2a] mb-2">
            <span className="text-[#888888]">STICKY KEY: {docKey} {isSticky ? '(PERMANENT READ-ONLY)' : ''}</span>
            <button
              type="button"
              id="btn-copy-sticky"
              onClick={handleCopy}
              className="text-[#dddddd] hover:text-white flex items-center gap-1 cursor-pointer select-none"
            >
              📋 {copyStatus}
            </button>
          </div>

          {/* Text Area */}
          <textarea
            id="sticky-editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={isSticky}
            placeholder={isSticky ? 'Read-only content...' : 'Enter content to stick permanently...'}
            className={`hp-textarea border-none bg-transparent min-h-[500px] h-[65vh] p-3 text-sm focus:outline-none ${
              isSticky ? 'bg-[#161616] text-[#aaaaaa] cursor-default' : ''
            }`}
            spellCheck={false}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-3">
            <button
              type="button"
              id="btn-stick"
              onClick={handleStick}
              disabled={isSticky}
              className={`hp-button ${isSticky ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSticky ? 'Stuck' : 'Stick'}
            </button>

            <button
              type="button"
              id="btn-sticky-exit"
              onClick={onExit}
              className="hp-button"
            >
              Exit
            </button>

            <button
              type="button"
              id="btn-stick-exit"
              onClick={handleStickAndExit}
              className="hp-button"
            >
              {isSticky ? 'Exit' : 'Stick & Exit'}
            </button>
          </div>

          {statusMsg && (
            <span className="text-xs text-[#888888] font-mono">{statusMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}
