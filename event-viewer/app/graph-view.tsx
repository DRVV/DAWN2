'use client'
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// 1. Only import ForceGraph2D dynamically, SSR off
// const ForceGraph2D = dynamic(
//   () => import('force-graph').then((mod) => mod.ForceGraph2D),
//   { ssr: false }
// );
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
);
export default function GraphView() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const fgRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/getWords')
      .then((res) => res.json())
      .then((data) => setGraphData(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ForceGraph2D
        ref={fgRef as any}
        graphData={graphData}
        nodeLabel="label"
        linkLabel={(link: any) =>
          link.similarity
            ? `Similarity: ${link.similarity.toFixed(2)}`
            : ''
        }
        nodeAutoColorBy="label"
      />
    </div>
  );
}
