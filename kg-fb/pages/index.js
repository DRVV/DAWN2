// pages/index.js
import { useState, useEffect, useCallback } from 'react';
import GraphComponent from '../components/GraphComponent';
import FeedbackPanel from '../components/FeedbackPanel';
import styles from './index.module.css';

export default function Home() {
  const [graphData, setGraphData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null); // { type, id, position }

  useEffect(() => {
    // Fetch the graph data from the server or use default data
    const fetchGraphData = async () => {
      const response = await fetch('/api/get-graph-data');
      const data = await response.json();
      setGraphData(data);
    };

    fetchGraphData();
  }, []);

  // Use useCallback to prevent unnecessary re-renders
  const handleElementClick = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  const handleCloseFeedback = () => {
    setSelectedElement(null);
  };

  // Function to calculate the panel position to ensure it stays within viewport
  const calculatePanelPosition = (x, y) => {
    const panelWidth = 300; // Match the CSS width
    const panelHeight = 400; // Match the CSS max-height
    const offset = 10; // Offset from the click position

    // Get viewport dimensions
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    // Initial position
    let top = y + offset;
    let left = x + offset;

    // Adjust if panel exceeds viewport width
    if (left + panelWidth > viewportWidth) {
      left = viewportWidth - panelWidth - offset;
    }

    // Adjust if panel exceeds viewport height
    if (top + panelHeight > viewportHeight) {
      top = viewportHeight - panelHeight - offset;
    }

    return { top, left };
  };

  return (
    <div className={styles.container}>
      <div className={styles.graphSection}>
        <GraphComponent
          graphData={graphData}
          onElementClick={handleElementClick}
        />
      </div>
      {selectedElement && selectedElement.position && (
        <FeedbackPanel
          element={selectedElement}
          onClose={handleCloseFeedback}
          position={calculatePanelPosition(selectedElement.position.x, selectedElement.position.y)}
        />
      )}
    </div>
  );
}
