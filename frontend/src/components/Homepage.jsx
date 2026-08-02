import React, { useState } from 'react';

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
    <div className="min-h-screen bg-[#111111] text-[#dddddd] flex flex-col items-center pt-24 px-4">
      {/* Top Center Title */}
      <h1 className="text-2xl font-bold tracking-wider mb-8 text-[#dddddd]">
        HIDDEN PAD
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
            🔍 Search
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
