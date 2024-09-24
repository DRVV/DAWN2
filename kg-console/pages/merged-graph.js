// pages/merged-graph.js

import fs from 'fs';
import path from 'path';
import { useEffect, useRef } from 'react';
import { read } from 'graphlib-dot';
import { Network } from 'vis-network';
import { graphlibToVis } from '../utils/graphlibToVis';
import Layout from '../components/Layout';
import styles from '../styles/MergedGraph.module.css';

export async function getStaticProps() {
  // Define the path to the merged graph
  const mergedGraphPath = path.join(
    process.cwd(),
    'public',
    'static',
    'project',
    'merged_graph.dot'
  );

  // Read and parse the .dot file
  const mergedGraphContent = fs.readFileSync(mergedGraphPath, 'utf8');
  const mergedGraph = read(mergedGraphContent);

  // Convert the graph to vis.js format
  const graphData = graphlibToVis(mergedGraph);

  return {
    props: {
      graphData,
    },
  };
}

export default function MergedGraphPage({ graphData }) {
  const graphRef = useRef(null);

  useEffect(() => {
    if (graphRef.current && graphData) {
      const options = {
        nodes: {
          shape: 'dot',
          size: 10,
          font: {
            size: 14,
          },
        },
        edges: {
          arrows: {
            to: { enabled: true, scaleFactor: 0.5 },
          },
          smooth: {
            type: 'continuous',
          },
        },
        layout: {
          improvedLayout: true,
          hierarchical: false,
        },
        physics: {
          enabled: true,
          stabilization: {
            iterations: 1000,
          },
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -50,
          },
        },
        interaction: {
          navigationButtons: true,
          keyboard: true,
        },
      };

    const network = new Network(graphRef.current, graphData, options);
  }
  }, [graphData]);

return (
  <Layout>
    <h1 className={styles.heading}>Merged Graph Visualization</h1>
    <div ref={graphRef} className={styles.graphContainer}></div>
  </Layout>
);
}
