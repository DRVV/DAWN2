// pages/projects/[projectId]/batches/[batchId].js

import fs from 'fs';
import path from 'path';
import { read } from 'graphlib-dot';
import { graphlibToVis } from '../../../../utils/graphlibToVis'; // Adjust the import path
import Layout from '../../../../components/Layout';
import styles from '../../../../styles/Batch.module.css';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Network } from 'vis-network';
import axios from 'axios';
import { DataSet } from 'vis-data';

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

  let kgCandidateData = null; // Initialize as null

  // **Check if kg_candidate.dot exists**
  if (fs.existsSync(kgCandidateDotPath)) {
    // Read and process kg_candidate.dot
    const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');
    const kgCandidateGraph = read(kgCandidateDotContent);
    kgCandidateData = graphlibToVis(kgCandidateGraph);
  }

  // const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');

  // Parse .dot files into graphlib graphs
  const kgGraph = read(kgDotContent);
  // const kgCandidateGraph = read(kgCandidateDotContent);

  // Convert graphlib graphs to vis.js format
  const kgData = graphlibToVis(kgGraph);
  //const kgCandidateData = graphlibToVis(kgCandidateGraph);

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
  // const [kgCandidateDataState, setKgCandidateDataState] = useState(kgCandidateData);
  const [commentMessage, setCommentMessage] = useState(metadata.commentMessage || '');

  const kgNetworkRef = useRef(null);
  // Network instances
  const kgNetworkInstanceRef = useRef(null); // Ref to store the Current Graph network instance
  //const kgCandidateNetworkInstanceRef = useRef(null); // Ref to store the Candidate Graph network instance

  const kgCandidateNetworkRef = useRef(null);
  const kgCandidateNetworkInstanceRef = useRef(null);

  const [selectedElement, setSelectedElement] = useState(null);
  const [editData, setEditData] = useState({});

  // Add Node/Edge
  const [isAddNodeMode, setIsAddNodeMode] = useState(false);

  const [isAddEdgeMode, setIsAddEdgeMode] = useState(false);
  const [edgeSourceNode, setEdgeSourceNode] = useState(null);

  // Change to crosshair
  const [cursorStyle, setCursorStyle] = useState('default');

  // generating merge candidate
  const [isGenerating, setIsGenerating] = useState(false);




  // node state

  const [kgCandidateDataState, setKgCandidateDataState] = useState(() => {
    // Initialize nodes with movable positions
    const initialNodes = kgCandidateData.nodes.map((node) => ({
      ...node,
      fixed: { x: false, y: false }, // Allow nodes to be dragged
      //x: node.x !== undefined ? node.x : 0, // Provide default x if undefined
      //y: node.y !== undefined ? node.y : 0, // Provide default y if undefined
    }));
    return {
      ...kgCandidateData,
      nodes: initialNodes,
    };
  });


  
  // direct access to nodes and edges
  const nodes = useRef(new DataSet(kgCandidateDataState.nodes));
  const edges = useRef(new DataSet(kgCandidateDataState.edges));




  const handleGenerateCandidateGraph = async () => {
    try {
      setIsGenerating(true); // Optional: Show a loading indicator
      const response = await axios.post('/api/generateCandidateGraph', {
        projectId,
        batchId,
      });

      console.log(`response success? ${response.data.success}`)

      if (response.data.success) {
        // Fetch the updated graph data
        const graphResponse = await axios.get('/api/getGraphData', {
          params: { projectId, batchId },
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        console.log('getGraphData response:', graphResponse);

        if (graphResponse.data.success) {
          // Update the state with the new graph data
          const newKgCandidateData = graphResponse.data.kgCandidateData;
          if (newKgCandidateData) {
            setKgCandidateDataState(newKgCandidateData);
            // Re-render the network
            // if (kgCandidateNetworkInstanceRef.current) {
            //   kgCandidateNetworkInstanceRef.current.setData(newKgCandidateData);
            // } else {
            //   // Initialize the network if it doesn't exist
            //   const options = {
            //     nodes: {
            //       shape: 'dot',
            //       size: 15,
            //     },
            //     edges: {
            //       arrows: 'to',
            //     },
            //     layout: {
            //       improvedLayout: true,
            //     },
            //     physics: {
            //       enabled: true,
            //     },
            //   };

            //   const kgCandidateNetwork = new Network(
            //     kgCandidateNetworkRef.current,
            //     newKgCandidateData,
            //     options
            //   );
            //   kgCandidateNetworkInstanceRef.current = kgCandidateNetwork;

            //   // Add event listeners as before
            //   kgCandidateNetwork.on('click', handleNetworkClick);
            // }

            // alert('Candidate graph generated successfully.');
          } else {
            alert('Failed to fetch the updated candidate graph: No data received.');
          }
        } else {
          alert(`Failed to fetch the updated candidate graph: ${graphResponse.data.error}`);
        }
      } else {
        alert(`Failed to generate candidate graph: ${response.data.error}`);
      }

    } catch (error) {
      console.error('Error generating candidate graph:', error);
      alert('Failed to generate candidate graph.');
    } finally {
      setIsGenerating(false); // Hide the loading indicator
    }
  };

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


  useEffect(() => {
    const updateState = () => {
      setKgCandidateDataState({
        nodes: nodes.current.get(),
        edges: edges.current.get(),
      });
    };
  
    nodes.current.on('*', updateState);
    edges.current.on('*', updateState);
  
    return () => {
      nodes.current.off('*', updateState);
      edges.current.off('*', updateState);
    };
  }, []);

  // Handle Save button in metadata panel
  
  const handleDragEnd = useCallback(
    (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const positions = kgCandidateNetworkInstanceRef.current.getPositions(nodeId);
        const { x, y } = positions[nodeId];

        // Update the node's position directly in the DataSet
        nodes.current.update({ id: nodeId, x, y });
      }
    },
    []
  );

  const handleNodeEdit = (updatedNodeData) => {
    // const positions = kgCandidateNetworkInstanceRef.current.getPositions();
    console.log('Updated Node Data:', updatedNodeData);
    // Update the node in the DataSet
    const { id, label, ...rest } = updatedNodeData;
    nodes.current.update({ id, label, ...rest });
    // nodes.current.update(updatedNodeData);

    // Update the selection
    setSelectedElement({ type: 'node', data: updatedNodeData });
    setEditData(updatedNodeData);
  };


  const handleEdgeEdit = (updatedEdgeData) => {
    //const positions = kgCandidateNetworkInstanceRef.current.getPositions();
    // Update the edge in the DataSet
    edges.current.update(updatedEdgeData);

    setSelectedElement({ type: 'edge', data: updatedEdgeData });

    setEditData(updatedEdgeData);
  };


  const handleNetworkClick = useCallback(
    (params) => {
      console.log('handleNetworkClick called with params:', params);
      console.log('isAddNodeMode:', isAddNodeMode);
      console.log('isAddEdgeMode', isAddEdgeMode);
      console.log('params.nodes.length:', params.nodes.length);
      console.log('params.edges.length:', params.edges.length);

      if (isAddNodeMode && params.nodes.length === 0 && params.edges.length === 0) {
        console.log('Adding new node...');
        const position = params.pointer.canvas;
        const newNodeId = 'node' + Date.now();
        const nodeLabel = prompt('Enter label for the new node:', 'New Node');

        if (nodeLabel === null) {
          // User canceled the prompt
          return;
        }

        const newNode = {
          id: newNodeId,
          label: nodeLabel || 'New Node',
          x: position.x,
          y: position.y,
          fixed: { x: false, y: false },
        };

        // Add the new node to the DataSet
        nodes.current.add(newNode);
        console.log('New node added:', newNode);

        // Reset modes and cursor
        setIsAddNodeMode(false);
        setCursorStyle('default');
        alert('Node added.');
      } else if (isAddEdgeMode) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          if (!edgeSourceNode) {
            setEdgeSourceNode(nodeId);
            alert('Source node selected. Now select the target node.');
          } else if (edgeSourceNode === nodeId) {
            alert('Please select a different node as the target.');
          } else {
            const edgeLabel = prompt('Enter label for the new edge:', 'New Edge');
            const newEdgeId = 'edge' + Date.now();

            if (edgeLabel === null) {
              // User canceled the prompt
              return;
            }

            const newEdge = {
              id: newEdgeId,
              from: edgeSourceNode,
              to: nodeId,
              label: edgeLabel || '',
              arrows: 'to',
            };

            // Add the new edge to the DataSet
            edges.current.add(newEdge);
            console.log('New edge added:', newEdge);

            // Reset modes and cursor
            setIsAddEdgeMode(false);
            setEdgeSourceNode(null);
            setCursorStyle('default');
            alert('Edge added.');
          }
        } else {
          alert('Please select a node.');
        }
      } else {
        // Selection logic
        if (params.nodes.length > 0) {
          // Node selected
          const nodeId = params.nodes[0];
          const nodeData = nodes.current.get(nodeId);
          console.log('Node selected:', nodeData);
          setSelectedElement({ type: 'node', data: nodeData });
          setEditData({ ...nodeData });
        } else if (params.edges.length > 0) {
          // Edge selected
          const edgeId = params.edges[0];
          const edgeData = edges.current.get(edgeId);
          console.log('Edge selected:', edgeData);
          setSelectedElement({ type: 'edge', data: edgeData });
          setEditData({ ...edgeData });
        } else {
          // Clicked on empty space
          setSelectedElement(null);
          setEditData({});
        }
      }
    },
    [isAddNodeMode, setIsAddNodeMode, isAddEdgeMode, edgeSourceNode]
  );
  // for incoming graph
  useEffect(() => {
    const options = {
      physics: false, // Disable physics to fix node positions
      nodes: {
        shape: 'dot',
        size: 15,
      },
      edges: {
        arrows: {
          to: { enabled: true },
        },
      },
      layout: {
        improvedLayout: false, // Disable automatic layout improvements
      },
      interaction: {
        navigationButtons: true,
        keyboard: true,
      },
    };


    // Render kgData (Current Graph)
    if (kgNetworkRef.current && kgData) {
      if (!kgNetworkInstanceRef.current) {
        // Initialize the network
        kgNetworkInstanceRef.current = new Network(kgNetworkRef.current, kgData, options);

        // Add event listeners if needed
        // kgNetworkInstanceRef.current.on('click', handleKgNetworkClick);
      } else {
        // Update the network data
        kgNetworkInstanceRef.current.setData(kgData);
      }
    }
  }, [kgData]);

  
  // init the network

  const options = {
    physics: false, // Disable physics to fix node positions
    nodes: {
      shape: 'dot',
      size: 15,
    },
    edges: {
      arrows: {
        to: { enabled: true },
      },
    },
    layout: {
      improvedLayout: false, // Disable automatic layout improvements
    },
    interaction: {
      navigationButtons: true,
      keyboard: true,
    },
  };
  useEffect(() => {
    if (kgCandidateNetworkRef.current) {
      if (!kgCandidateNetworkInstanceRef.current) {
        kgCandidateNetworkInstanceRef.current = new Network(
          kgCandidateNetworkRef.current,
          { nodes: nodes.current, edges: edges.current },
          options
        );

        
      }

      kgCandidateNetworkInstanceRef.current.on('click', handleNetworkClick);
      kgCandidateNetworkInstanceRef.current.on('dragEnd', handleDragEnd);

      // Update cursor style
      const container = kgCandidateNetworkInstanceRef.current.body.container;
      if (container) {
        container.style.cursor = cursorStyle;
      }

      return () => {
        kgCandidateNetworkInstanceRef.current.off('click', handleNetworkClick);
        kgCandidateNetworkInstanceRef.current.off('dragEnd', handleDragEnd);
      };
    }
  }, [handleNetworkClick, handleDragEnd, cursorStyle]);



  return (
    <Layout>
      <h1 className={styles.heading}>{metadata.title || `Batch: ${batchId}`}</h1>


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
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${isAddNodeMode ? styles.activeButton : ''}`}
          onClick={() => {
            const newMode = !isAddNodeMode;
            console.log('newMode:', newMode);
            setIsAddNodeMode(newMode);
            setIsAddEdgeMode(false);
            setEdgeSourceNode(null);
            setCursorStyle(newMode ? 'crosshair' : 'default');

          }
          }
        >
          {isAddNodeMode ? 'Cancel Add Node' : 'Add Node'}
        </button>
        <button
          className={`${styles.button} ${isAddEdgeMode ? styles.activeButton : ''}`}
          onClick={() => {
            const newMode = !isAddEdgeMode
            setIsAddEdgeMode(newMode);
            setIsAddNodeMode(false); // Ensure only one mode is active
            setEdgeSourceNode(null); // Reset source node selection
            setCursorStyle(newMode ? 'pointer' : 'default');
          }}
        >
          {isAddEdgeMode ? 'Cancel Add Edge' : 'Add Edge'}
        </button>
        {
        console.log('candidate state', kgCandidateDataState)
        
        }
        {console.log('isAddNodeMode', isAddNodeMode)}
        <button
          className={styles.button}
          onClick={handleGenerateCandidateGraph}
          disabled={isGenerating || kgCandidateDataState}
        >
          Generate Candidate Graph
        </button>
      </div>

      <div className={styles.graphSection}>
        <div
          ref={kgCandidateNetworkRef}
          className={styles.graphContainer}
        ></div>
        <div className={styles.metadataPanel}>
          {selectedElement ? (
            <div>
              <h3>{selectedElement.type === 'node' ? 'Node' : 'Edge'} Metadata</h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedElement.type === 'node') {
                    handleNodeEdit(editData);
                  } else if (selectedElement.type === 'edge') {
                    handleEdgeEdit(editData);
                  }
                }}
              >
                <label>
                  Label:
                  <input
                    type="text"
                    value={editData.label || ''}
                    onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                  />
                </label>
                {/* Additional fields can be added here */}
                <button type="submit">Save</button>
              </form>
            </div>
          ) : (
            <p>Select a node or edge to view and edit its metadata.</p>
          )}
        </div>
        {!kgCandidateDataState && (isGenerating ? (
          <p>generating candidate graph...</p>
        ) : (
          <div>
            <p>Candidate Not Found.</p>

          </div>
        ))

        }
      </div>
    </Layout>
  );
}
