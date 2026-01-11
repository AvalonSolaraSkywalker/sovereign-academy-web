// src/components/DynamicMyButton.tsx
'use client';                     // 👈 first line, mandatory

import dynamic from 'next/dynamic';

// The path is relative to this file. MyButton lives in the SAME folder.
const MyButton = dynamic(() => import('./MyButton'), {
  ssr: false,                    // 👈 never render on the server
});

export default MyButton;