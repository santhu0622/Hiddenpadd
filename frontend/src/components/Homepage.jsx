import React, { useState } from 'react';

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Homepage({ onSearch, onStickySearch }) {
  const [keyInput, setKeyInput] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!keyInput.trim()) return;
    onSearch(keyInput.trim());
  };

  const handleStickySearch = (e) => {
    e?.preventDefault();
    if (!keyInput.trim()) return;
    onStickySearch(keyInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#dddddd] flex flex-col items-center pt-24 px-4 font-mono">
      {/* Top Center Title */}
      <h1 className="text-2xl font-bold tracking-widest mb-8 text-[#eeeeee] uppercase" style={{ fontFamily: 'Space Mono, monospace' }}>
        STICKY PAD
      </h1>

      {/* Input Box and Action Buttons */}
      <form onSubmit={handleSearch} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          id="key-input"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Enter Key..."
          className="hp-input w-full text-center tracking-wide"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        <div className="flex justify-center gap-3 mt-2">
          <button
            type="submit"
            id="btn-search"
            className="hp-button"
          >
            <SearchIcon /> Search
          </button>
          <button
            type="button"
            id="btn-sticky-search"
            onClick={handleStickySearch}
            className="hp-button"
          >
            Sticky Search
          </button>
        </div>
      </form>
    </div>
  );
}
