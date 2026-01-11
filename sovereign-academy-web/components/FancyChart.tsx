// src/components/FancyChart.tsx
'use client';

import React, { useState } from 'react';

export default function FancyChart() {
  // Example hook – you can replace with your real chart logic
  const [dummy] = useState('chart data');

  return (
    <div className="p-4 bg-gray-100 rounded">
      {/* Replace this with your actual chart library/component */}
      <pre>{JSON.stringify(dummy, null, 2)}</pre>
    </div>
  );
}