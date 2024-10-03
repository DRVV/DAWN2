// pages/index.js

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import GraphComponent from '../components/GraphComponent';
import FeedbackPanel from '../components/FeedbackPanel';
import styles from './index.module.css';

export default function Home() {
  const [graphData, setGraphData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const router = useRouter();

  // Function to decode Base64 and parse JSON
  const decodeGraphData = (encodedData) => {
    try {
      const decoded = atob(encodedData);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode graph data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const { data } = router.query;
      if (data) {
        const decodedData = decodeGraphData(data);
        if (decodedData) {
          setGraphData(decodedData);
        } else {
          // Handle invalid data
          setGraphData({ nodes: [], edges: [] });
        }
      } else {
        // Optionally, set to empty or fetch default graph data
        setGraphData({ nodes: [], edges: [] });
      }
    }
  }, [router.isReady, router.query]);

  const handleElementClick = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  const handleCloseFeedback = () => {
    setSelectedElement(null);
  };

  return (
    <div className={styles.container}>
        {/* Header Section */}
           <header className={styles.header}>
        <h1 className={styles.title}>Knowledge Graph Feedback</h1>
        <p className={styles.description}>
          Click on nodes or edges to provide your feedback.
        </p>
      </header>

      <div className={styles.graphSection}>
        {graphData ? (
          <GraphComponent
            graphData={graphData}
            onElementClick={handleElementClick}
          />
        ) : (
          <p>Loading graph...</p>
        )}
      </div>
      {selectedElement && selectedElement.position && (
        <FeedbackPanel
          element={selectedElement}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  );
}
