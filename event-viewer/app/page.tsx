// pages/index.jsx

import React from 'react';
import GraphView from './graph-view';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Word Clusters Visualization</h1>
      <p>This graph shows words and their closeness (via cosine similarity).</p>
      <GraphView />
    </div>
  );
}
