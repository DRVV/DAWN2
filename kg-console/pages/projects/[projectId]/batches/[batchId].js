// pages/projects/[projectId]/batches/[batchId].js

import fs from 'fs';
import path from 'path';
import { read } from 'graphlib-dot';
import { graphlibToVis } from '../../../../utils/graphlibToVis'; // Adjust the import path
import Layout from '../../../../components/Layout';
import styles from '../../../../styles/Batch.module.css';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import axios from 'axios';

export async function getStaticPaths() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'static', 'project');
  const projectFolders = fs.readdirSync(projectsDirectory);

  let paths = [];

  projectFolders.forEach((projectFolder) => {
    const batchesDirectory = path.join(projectsDirectory, projectFolder, 'batches');
    if (fs.existsSync(batchesDirectory)) {
      const batchFolders = fs.readdirSync(batchesDirectory);
      batchFolders.forEach((batchFolder) => {
        paths.push({
          params: {
            projectId: projectFolder,
            batchId: batchFolder,
          },
        });
      });
    }
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { projectId, batchId } = params;

  const batchDirectory = path.join(
    process.cwd(),
    'public',
    'static',
    'project',
    projectId,
    'batches',
    batchId
  );

  const metadataPath = path.join(batchDirectory, 'metadata.json');
  const kgDotPath = path.join(batchDirectory, 'kg.dot');
  const kgCandidateDotPath = path.join(batchDirectory, 'kg_candidate.dot');

  // Read metadata
  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  const metadata = JSON.parse(metadataContent);

  // Read .dot files
  const kgDotContent = fs.readFileSync(kgDotPath, 'utf8');
  const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');

  // Parse .dot files into graphlib graphs
  const kgGraph = read(kgDotContent);
  const kgCandidateGraph = read(kgCandidateDotContent);

  // Convert graphlib graphs to vis.js format
  const kgData = graphlibToVis(kgGraph);
  const kgCandidateData = graphlibToVis(kgCandidateGraph);

  return {
    props: {
      projectId,
      batchId,
      metadata,
      kgData,
      kgCandidateData,
    },
  };
}

export default function BatchPage({
  projectId,
  batchId,
  metadata,
  kgData,
  kgCandidateData,
}) {
  const [isPublished, setIsPublished] = useState(metadata.isPublished);
  const [kgCandidateDataState, setKgCandidateDataState] = useState(kgCandidateData);
  const [commentMessage, setCommentMessage] = useState(metadata.commentMessage || '');

  const kgNetworkRef = useRef(null);
  const kgCandidateNetworkRef = useRef(null);
  const kgCandidateNetworkInstanceRef = useRef(null);

  const [selectedElement, setSelectedElement] = useState(null);
  const [editData, setEditData] = useState({});

  // Handle Publish button
  const handlePublish = async () => {
    if (confirm('Are you sure you want to publish this batch?')) {
      try {
        const response = await axios.post('/api/publishBatch', {
          projectId,
          batchId,
          kgCandidateDataState, // Send the current graph data
          commentMessage,       // Send the comment
        });

        alert(response.data.message);

        // Update local state
        setIsPublished(true);
      } catch (error) {
        console.error('Error publishing batch:', error);
        alert('Failed to publish batch.');
      }
    }
  };

  // Handle Revert Changes button
  const handleRevertChanges = async () => {
    if (confirm('Are you sure you want to revert all changes?')) {
      try {
        const response = await axios.get(
          `/api/getGraphData?projectId=${projectId}&batchId=${batchId}`
        );
        const { kgCandidateData: originalKgCandidateData } = response.data;

        // Update the graph data
        setKgCandidateDataState(originalKgCandidateData);

        // Re-render the network
        kgCandidateNetworkInstanceRef.current.setData(originalKgCandidateData);

        // Clear selection and edit data
        setSelectedElement(null);
        setEditData({});
        alert('Changes reverted.');
      } catch (error) {
        console.error('Error reverting changes:', error);
        alert('Failed to revert changes.');
      }
    }
  };

  // Handle form changes
  const handleEditChange = (field, value) => {
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  // Handle Save button in metadata panel
  const handleSave = (e) => {
    e.preventDefault();

    if (selectedElement.type === 'node') {
      // Update node data
      const updatedNodes = kgCandidateDataState.nodes.map((node) =>
        node.id === editData.id ? { ...node, ...editData } : node
      );
      const updatedData = { ...kgCandidateDataState, nodes: updatedNodes };
      setKgCandidateDataState(updatedData);

      // Re-render the network
      kgCandidateNetworkInstanceRef.current.setData(updatedData);
    } else if (selectedElement.type === 'edge') {
      // Update edge data
      const updatedEdges = kgCandidateDataState.edges.map((edge) =>
        edge.id === editData.id ? { ...edge, ...editData } : edge
      );
      const updatedData = { ...kgCandidateDataState, edges: updatedEdges };
      setKgCandidateDataState(updatedData);

      // Re-render the network
      kgCandidateNetworkInstanceRef.current.setData(updatedData);
    }

    alert('Changes saved.');
  };

  // Handle Cancel button in metadata panel
  const handleCancelEdit = () => {
    setEditData({ ...selectedElement.data });
  };

  useEffect(() => {
    // Options for the network
    const options = {
      nodes: {
        shape: 'dot',
        size: 15,
      },
      edges: {
        arrows: 'to',
      },
      layout: {
        improvedLayout: true,
      },
      physics: {
        enabled: true,
      },
    };

    // Render kgData (Current Graph)
    if (kgNetworkRef.current && kgData) {
      const kgNetwork = new Network(kgNetworkRef.current, kgData, options);
    }

    // Render kgCandidateData (Merge Candidate Graph)
    if (kgCandidateNetworkRef.current && kgCandidateDataState) {
      const kgCandidateNetwork = new Network(
        kgCandidateNetworkRef.current,
        kgCandidateDataState,
        options
      );

      // Store the network instance in the ref
      kgCandidateNetworkInstanceRef.current = kgCandidateNetwork;

      // Add event listeners
      kgCandidateNetwork.on('click', function (params) {
        if (params.nodes.length > 0) {
          // Node clicked
          const nodeId = params.nodes[0];
          const nodeData = kgCandidateDataState.nodes.find((n) => n.id === nodeId);
          setSelectedElement({ type: 'node', data: nodeData });
          setEditData({ ...nodeData });
        } else if (params.edges.length > 0) {
          // Edge clicked
          const edgeId = params.edges[0];
          const edgeData = kgCandidateDataState.edges.find((e) => e.id === edgeId);
          setSelectedElement({ type: 'edge', data: edgeData });
          setEditData({ ...edgeData });
        } else {
          // Clicked on empty space
          setSelectedElement(null);
          setEditData({});
        }
      });
    }
  }, [kgData, kgCandidateDataState]);

  return (
    <Layout>
      <h1 className={styles.heading}>{metadata.title || `Batch: ${batchId}`}</h1>
      <p className={styles.description}>
        {metadata.description || 'No description available.'}
      </p>

      {/* Display Publish Status */}
      <p>
        <strong>Published:</strong> {isPublished ? '✅ Yes' : '❌ No'}
      </p>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handlePublish}>
          Publish
        </button>
        <button className={styles.button} onClick={handleRevertChanges}>
          Revert Changes
        </button>
      </div>

      {/* Comment Text Area */}
      <h3>Comment</h3>
      <textarea
        className={styles.commentTextArea}
        value={commentMessage}
        onChange={(e) => setCommentMessage(e.target.value)}
        placeholder="Enter your comments here..."
      ></textarea>

      {/* Current Graph */}
      <h2>Current Graph</h2>
      <div
        ref={kgNetworkRef}
        className={styles.graphContainer}
        style={{ marginBottom: '40px' }}
      ></div>

      {/* Merge Candidate Graph Section */}
      <h2>Merge Candidate Graph</h2>
      <div className={styles.graphSection}>
        <div ref={kgCandidateNetworkRef} className={styles.graphContainer}></div>
        <div className={styles.metadataPanel}>
          {selectedElement ? (
            <div>
              <h3>{selectedElement.type === 'node' ? 'Node' : 'Edge'} Metadata</h3>
              <form onSubmit={handleSave}>
                <div className={styles.formGroup}>
                  <label>ID:</label>
                  <input
                    type="text"
                    value={editData.id}
                    onChange={(e) => handleEditChange('id', e.target.value)}
                    disabled // ID should not be editable
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Label:</label>
                  <input
                    type="text"
                    value={editData.label || ''}
                    onChange={(e) => handleEditChange('label', e.target.value)}
                  />
                </div>
                {/* Add more fields as needed */}
                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.saveButton}>
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p>Select a node or edge to view and edit its metadata.</p>
          )}
        </div>
      </div>

      <p>
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
      </p>
    </Layout>
  );
}
