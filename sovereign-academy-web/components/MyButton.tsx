// src/components/MyButton.tsx
'use client';                     // 👈 MUST be the very first line, no preceding whitespace

import React, { useState } from 'react';

export default function MyButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clicked, setClicked] = useState(false);

  return (
    <button
      className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded ${clicked ? 'opacity-75' : ''}`}
      onClick={() => setClicked(!clicked)}
    >
      {children}
    </button>
  );
}