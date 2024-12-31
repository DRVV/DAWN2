import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Network } from "vis-network";

const WordCloseness = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [springScale, setSpringScale] = useState(0.2); // Default spring scale

  // Fetch graph data from the backend
  const fetchGraphData = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/cosine-similarities?collection_name=words_collection"
      );
      const data = await response.json();

      const nodes = [];
      const edges = [];
      const uniqueWords = new Set();

      // Process backend data into nodes and edges
      data.forEach(({ word1, word2, similarity }) => {
        uniqueWords.add(word1);
        uniqueWords.add(word2);

        // Add edges with dynamic spring constant based on similarity
        edges.push({
          from: word1,
          to: word2,
          label: similarity.toFixed(2), // Display similarity as edge label
          physics: {
            springConstant: similarity * springScale, // Scale spring constant dynamically
          },
          width: similarity * 5, // Adjust edge width for better visualization
        });
      });

      // Create nodes
      Array.from(uniqueWords).forEach((word) => {
        nodes.push({
          id: word,
          label: word,
        });
      });

      setGraphData({ nodes, edges });
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  // Fetch graph data whenever the springScale changes
  useEffect(() => {
    fetchGraphData();
  }, [springScale]);

  // Initialize vis-network graph
  useEffect(() => {
    const container = document.getElementById("network");
    if (container && graphData.nodes.length > 0) {
      new Network(container, graphData, {
        physics: {
          enabled: true,
          solver: "forceAtlas2Based", // Use force-based physics solver
          forceAtlas2Based: {
            gravitationalConstant: -50, // Controls repulsion between nodes
            centralGravity: 0.01, // Pulls nodes toward the center
            springConstant: 0.08, // Default spring constant for edges
          },
          maxVelocity: 50, // Maximum movement speed of nodes
          stabilization: {
            enabled: true,
            iterations: 1000, // Number of stabilization iterations
          },
        },

        edges: {
          smooth: {
            enabled: true,
            type: "dynamic", // Change this to other options like "straight" or "cubicBezier"
          },
        },
      });
    }
  }, [graphData]);

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <h1>Word Closeness Graph</h1>
        <label>
          Adjust Spring Constant Scale:
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={springScale}
            onChange={(e) => setSpringScale(Number(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </label>
        <div
          id="network"
          style={{
            height: "600px",
            width: "100%",
            border: "1px solid black",
            marginTop: "20px",
          }}
        />
      </div>
    </Layout>
  );
};

export default WordCloseness;
