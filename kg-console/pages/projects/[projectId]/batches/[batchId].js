// pages/projects/[projectId]/batches/[batchId].js

import fs from 'fs';
import path from 'path';
import { read } from 'graphlib-dot';
import { graphlibToVis } from '../../../../utils/graphlibToVis';
import Layout from '../../../../components/Layout';
import styles from '../../../../styles/Batch.module.css';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Network } from 'vis-network';
import axios from 'axios';
import { DataSet } from 'vis-data';
import { parse } from 'csv-parse/sync';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { getAllBatches } from '@/lib/getAllBatches';

function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className={styles.notification}>
      {message}
      <button onClick={onClose}>x</button>
    </div>
  );
}

function InstructionOverlay({ mode }) {
  if (!mode) return null;
  const instructions =
    mode === 'addNode'
      ? "Click anywhere on the canvas to add a node. Then fill out its details in the side panel."
      : "Select a source node, then select the target node to add an edge. Finally, fill out details in the side panel.";
  return <div className={styles.instructionOverlay}>{instructions}</div>;
}



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

// // export async function getStaticProps({ params }) {
//   const { projectId, batchId } = params;

//   const batchesDirectory = path.join(
//     process.cwd(),
//     'public',
//     'static',
//     'project',
//     projectId,
//     'batches'
//   );

//   const batchFolders = fs.readdirSync(batchesDirectory).filter((f) =>
//     fs.statSync(path.join(batchesDirectory, f)).isDirectory()
//   );

//   batchFolders.sort(); // Assuming batch directories are named in a sortable manner

//   const currentIndex = batchFolders.indexOf(batchId);
//   const nextBatchId = currentIndex >= 0 && currentIndex < batchFolders.length - 1
//     ? batchFolders[currentIndex + 1]
//     : null;

//   const batchDirectory = path.join(batchesDirectory, batchId);
//   const metadataPath = path.join(batchDirectory, 'metadata.json');
//   const kgDotPath = path.join(batchDirectory, 'kg.dot');
//   const kgCandidateDotPath = path.join(batchDirectory, 'kg_edited.dot');
//   const rawBatchPath = path.join(batchDirectory, 'raw_batch.csv');

//   const metadataContent = fs.readFileSync(metadataPath, 'utf8');
//   const metadata = JSON.parse(metadataContent);

//   const kgDotContent = fs.readFileSync(kgDotPath, 'utf8');
//   const kgGraph = read(kgDotContent);
//   const kgData = graphlibToVis(kgGraph);

//   const rawBatchContent = fs.readFileSync(rawBatchPath, 'utf8');
//   const rawBatchRecords = parse(rawBatchContent, {
//     columns: false,
//     skip_empty_lines: true,
//   });

//   let kgCandidateData = null;
//   if (fs.existsSync(kgCandidateDotPath)) {
//     const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');
//     const kgCandidateGraph = read(kgCandidateDotContent);
//     kgCandidateData = graphlibToVis(kgCandidateGraph);
//   }

//   return {
//     props: {
//       projectId,
//       batchId,
//       metadata,
//       kgData,
//       kgCandidateData,
//       rawBatchRecords,
//       nextBatchId,
//     },
//   };
// //}

export async function getStaticProps({ params }) {
  const { projectId, batchId } = params;

  const allBatches = getAllBatches();
  const currentIndex = allBatches.findIndex(
    (item) => item.projectId === projectId && item.batchId === batchId
  );

  let nextBatchId = null;
  let nextProjectId = null;
  if (currentIndex !== -1 && currentIndex < allBatches.length - 1) {
    const nextBatch = allBatches[currentIndex + 1];
    nextBatchId = nextBatch.batchId;
    nextProjectId = nextBatch.projectId;
  }

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
  const kgCandidateDotPath = path.join(batchDirectory, 'kg_edited.dot');

  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  const metadata = JSON.parse(metadataContent);

  const kgDotContent = fs.readFileSync(kgDotPath, 'utf8');
  const kgGraph = read(kgDotContent);
  const kgData = graphlibToVis(kgGraph);

  // read csv as table
  const rawBatchPath = path.join(batchDirectory, 'raw_batch.csv');
  const rawBatchContent = fs.readFileSync(rawBatchPath, 'utf8');
  const rawBatchRecords = parse(rawBatchContent, {
    columns: false,
    skip_empty_lines: true,
  });

  let kgCandidateData = null;
  if (fs.existsSync(kgCandidateDotPath)) {
    const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');
    const kgCandidateGraph = read(kgCandidateDotContent);
    kgCandidateData = graphlibToVis(kgCandidateGraph);
  }

  return {
    props: {
      projectId,
      batchId,
      metadata,
      kgData,
      kgCandidateData,
      rawBatchRecords,
      nextBatchId,
      nextProjectId,
    },
  };
}


export default function BatchPage({
  projectId,
  batchId,
  metadata,
  kgData,
  kgCandidateData,
  rawBatchRecords,
  nextBatchId,
  nextProjectId
}) {
  const [label, setLabel] = useState('');
  const [isPublished, setIsPublished] = useState(metadata.isPublished);
  const [commentMessage, setCommentMessage] = useState(metadata.commentMessage || '');

  const kgNetworkRef = useRef(null);
  const kgNetworkInstanceRef = useRef(null);

  const kgCandidateNetworkRef = useRef(null);
  const kgCandidateNetworkInstanceRef = useRef(null);

  const [selectedElement, setSelectedElement] = useState(null);
  const [editData, setEditData] = useState({});

  const [isAddNodeMode, setIsAddNodeMode] = useState(false);
  const [isAddEdgeMode, setIsAddEdgeMode] = useState(false);
  const [edgeSourceNode, setEdgeSourceNode] = useState(null);

  const [cursorStyle, setCursorStyle] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState('');

  const [addElementModalOpen, setAddElementModalOpen] = useState(false);
  const [addingElementType, setAddingElementType] = useState(null); // 'node' or 'edge'
  const [pendingElement, setPendingElement] = useState(null);

  const [kgCandidateDataState, setKgCandidateDataState] = useState(() => {
    if (!kgCandidateData) return null;
    const initialNodes = kgCandidateData.nodes.map((node) => ({
      ...node,
      fixed: { x: false, y: false },
    }));
    return {
      ...kgCandidateData,
      nodes: initialNodes,
    };
  });

  const nodes = useRef(new DataSet(kgCandidateDataState ? kgCandidateDataState.nodes : []));
  const edges = useRef(new DataSet(kgCandidateDataState ? kgCandidateDataState.edges : []));

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleGenerateCandidateGraph = async () => {
    try {
      setIsGenerating(true);
      const response = await axios.post('/api/generateCandidateGraph', {
        projectId,
        batchId,
      });

      if (response.data.success) {
        const graphResponse = await axios.get('/api/getGraphData', {
          params: { projectId, batchId },
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (graphResponse.data.success) {
          const newKgCandidateData = graphResponse.data.kgCandidateData;
          if (newKgCandidateData) {
            setKgCandidateDataState(newKgCandidateData);
            nodes.current = new DataSet(newKgCandidateData.nodes);
            edges.current = new DataSet(newKgCandidateData.edges);
            if (kgCandidateNetworkInstanceRef.current) {
              kgCandidateNetworkInstanceRef.current.setData({
                nodes: nodes.current,
                edges: edges.current,
              });
            }
            showNotification('Candidate graph generated successfully.');
          } else {
            showNotification('No data received for the updated candidate graph.');
          }
        } else {
          showNotification(`Failed to fetch updated candidate graph: ${graphResponse.data.error}`);
        }
      } else {
        showNotification(`Failed to generate candidate graph: ${response.data.error}`);
      }

    } catch (error) {
      console.error('Error generating candidate graph:', error);
      showNotification('Failed to generate candidate graph.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (window.confirm('Are you sure you want to publish this batch?')) {
      try {
        const response = await axios.post('/api/publishBatch', {
          projectId,
          batchId,
          kgCandidateDataState,
          commentMessage,
        });

        showNotification(response.data.message);
        setIsPublished(true);
      } catch (error) {
        console.error('Error publishing batch:', error);
        showNotification('Failed to publish batch.');
      }
    }
  };

  const handleRevertChanges = async () => {
    if (window.confirm('Are you sure you want to revert all changes?')) {
      try {
        const response = await axios.get(
          `/api/getGraphData?projectId=${projectId}&batchId=${batchId}`
        );
        const { kgCandidateData: originalKgCandidateData } = response.data;
        setKgCandidateDataState(originalKgCandidateData);
        nodes.current = new DataSet(originalKgCandidateData.nodes);
        edges.current = new DataSet(originalKgCandidateData.edges);
        kgCandidateNetworkInstanceRef.current.setData(originalKgCandidateData);
        setSelectedElement(null);
        setEditData({});
        showNotification('Changes reverted.');
      } catch (error) {
        console.error('Error reverting changes:', error);
        showNotification('Failed to revert changes.');
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

  const handleDragEnd = useCallback(
    (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const positions = kgCandidateNetworkInstanceRef.current.getPositions(nodeId);
        const { x, y } = positions[nodeId];
        nodes.current.update({ id: nodeId, x, y });
      }
    },
    []
  );

  const handleNodeEdit = (updatedNodeData) => {
    nodes.current.update(updatedNodeData);
    setSelectedElement({ type: 'node', data: updatedNodeData });
    setEditData(updatedNodeData);
    showNotification('Node updated.');
  };

  const handleEdgeEdit = (updatedEdgeData) => {
    edges.current.update(updatedEdgeData);
    setSelectedElement({ type: 'edge', data: updatedEdgeData });
    setEditData(updatedEdgeData);
    showNotification('Edge updated.');
  };

  const finalizeAddElement = (label) => {
    if (!label) {
      // showNotification('No label provided. Operation cancelled.');
      // setAddElementModalOpen(false);
      // return;
      label = ''
    }

    if (addingElementType === 'node' && isAddNodeMode) {
      const newNode = {
        ...pendingElement,
        label: label,
      };
      nodes.current.add(newNode);
      showNotification('Node added.');
      setIsAddNodeMode(false);
      setCursorStyle('default');
    } else if (addingElementType === 'edge' && isAddEdgeMode) {
      const newEdge = {
        ...pendingElement,
        label: label,
      };
      edges.current.add(newEdge);
      showNotification('Edge added.');
      setIsAddEdgeMode(false);
      setEdgeSourceNode(null);
      setCursorStyle('default');
    }

    setAddElementModalOpen(false);
    setAddingElementType(null);
    setPendingElement(null);
  };

  const handleNetworkClick = useCallback(
    (params) => {
      if (isAddNodeMode && params.nodes.length === 0 && params.edges.length === 0) {
        const position = params.pointer.canvas;
        const newNodeId = 'node' + Date.now();
        const newNode = {
          id: newNodeId,
          label: '',
          x: position.x,
          y: position.y,
          fixed: { x: false, y: false },
        };
        setPendingElement(newNode);
        setAddingElementType('node');
        setAddElementModalOpen(true);
      } else if (isAddEdgeMode) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          if (!edgeSourceNode) {
            setEdgeSourceNode(nodeId);
            showNotification('Source node selected. Now select the target node.');
          } else if (edgeSourceNode === nodeId) {
            showNotification('Please select a different node as the target.');
          } else {
            const newEdgeId = 'edge' + Date.now();
            const newEdge = {
              id: newEdgeId,
              from: edgeSourceNode,
              to: nodeId,
              arrows: 'to',
              label: '',
            };
            setPendingElement(newEdge);
            setAddingElementType('edge');
            setAddElementModalOpen(true);
          }
        } else {
          showNotification('Please select a node to create an edge.');
        }
      } else {
        // Selection logic
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodeData = nodes.current.get(nodeId);
          setSelectedElement({ type: 'node', data: nodeData });
          setEditData({ ...nodeData });
        } else if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const edgeData = edges.current.get(edgeId);
          setSelectedElement({ type: 'edge', data: edgeData });
          setEditData({ ...edgeData });
        } else {
          setSelectedElement(null);
          setEditData({});
        }
      }
    },
    [isAddNodeMode, isAddEdgeMode, edgeSourceNode]
  );

  // -------------------------------
  // NEW FEATURE: APPEND NODE
  // -------------------------------
  const handleAppendNode = () => {
    if (selectedElement && selectedElement.type === 'node') {
      const sourceNodeId = selectedElement.data.id;
      // Get position of the selected node
      const positions = kgCandidateNetworkInstanceRef.current.getPositions(sourceNodeId);
      const { x, y } = positions[sourceNodeId];

      // Create a new node slightly offset from the source node
      const newNodeId = 'node' + Date.now();
      const newNode = {
        id: newNodeId,
        label: 'New Node', // Default label, user can edit later
        x: x + 50, // Offset by 50 units on x-axis
        y: y,
        fixed: { x: false, y: false },
      };

      // Create edge from sourceNode to newNode
      const newEdgeId = 'edge' + Date.now();
      const newEdge = {
        id: newEdgeId,
        from: sourceNodeId,
        to: newNodeId,
        arrows: 'to',
        label: ''
      };

      nodes.current.add(newNode);
      edges.current.add(newEdge);
      showNotification(`Appended a new node to ${sourceNodeId}.`);
    } else {
      showNotification('Please select a node first.');
    }
  };
  // -------------------------------

  const handleDeleteSelectedElement = () => {
    if (!selectedElement) return;
  
    if (selectedElement.type === 'node') {
      // Remove node from DataSet
      nodes.current.remove({ id: selectedElement.data.id });
      showNotification(`Node ${selectedElement.data.id} removed.`);
    } else if (selectedElement.type === 'edge') {
      // Remove edge from DataSet
      edges.current.remove({ id: selectedElement.data.id });
      showNotification(`Edge ${selectedElement.data.id} removed.`);
    }
  
    // Clear the selection
    setSelectedElement(null);
    setEditData({});
  };
  

  useEffect(() => {
    const options = {
      physics: false,
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
        improvedLayout: false,
        hierarchical: true
      },
      interaction: {
        navigationButtons: true,
        keyboard: true,
      },
    };

    if (kgNetworkRef.current && kgData) {
      if (!kgNetworkInstanceRef.current) {
        kgNetworkInstanceRef.current = new Network(kgNetworkRef.current, kgData, options);
      } else {
        kgNetworkInstanceRef.current.setData(kgData);
      }
    }
  }, [kgData]);

  const candidateOptions = {
    physics: false,
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
      improvedLayout: false,
      hierarchical: {
        enabled: true,
        sortMethod: "directed",
        shakeTowards: "roots"
      }
    },
    interaction: {
      navigationButtons: true,
      keyboard: true,
    },
  };

  useEffect(() => {
    if (kgCandidateNetworkRef.current && kgCandidateDataState) {
      if (!kgCandidateNetworkInstanceRef.current) {
        kgCandidateNetworkInstanceRef.current = new Network(
          kgCandidateNetworkRef.current,
          { nodes: nodes.current, edges: edges.current },
          candidateOptions
        );
      } else {
        kgCandidateNetworkInstanceRef.current.setData({
          nodes: nodes.current,
          edges: edges.current
        });
      }

      kgCandidateNetworkInstanceRef.current.on('click', handleNetworkClick);
      kgCandidateNetworkInstanceRef.current.on('dragEnd', handleDragEnd);

      const container = kgCandidateNetworkInstanceRef.current.body.container;
      if (container) {
        container.style.cursor = cursorStyle;
      }

      return () => {
        kgCandidateNetworkInstanceRef.current.off('click', handleNetworkClick);
        kgCandidateNetworkInstanceRef.current.off('dragEnd', handleDragEnd);
      };
    }
  }, [kgCandidateDataState, handleNetworkClick, handleDragEnd, cursorStyle]);

  return (
    <Layout>
      <h1 className={styles.heading}>{metadata.title || `Batch: ${batchId}`}</h1>

      <Notification
        message={notification}
        onClose={() => setNotification('')}
      />

      <p><strong>Published:</strong> {isPublished ? '✅ Yes' : '❌ No'}</p>

      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handlePublish}>
          Publish
        </button>
        <button className={styles.button} onClick={handleRevertChanges}>
          Revert Changes
        </button>
        {nextProjectId && nextBatchId && (
        <Link href={`/projects/${nextProjectId}/batches/${nextBatchId}`} passHref>
          <button className={styles.button}>Next ➜</button>
        </Link>
      )}
      </div>



      <div className={styles.gridContainer}>
        {/* Top Row: Titles */}
        <div className={styles.currentGraphTitle}>Original</div>
        <div className={styles.candidateGraphTitle}>Edited</div>
        {/* The third cell in top row is left blank as per requirements */}

        {/* Bottom Row: Graphs and Metadata */}
        <div className={styles.currentGraphArea}>
          <div ref={kgNetworkRef} className={styles.graphContainer}></div>
        </div>

        <div className={styles.candidateGraphArea}>

          <InstructionOverlay mode={isAddNodeMode ? 'addNode' : isAddEdgeMode ? 'addEdge' : null} />
          <div ref={kgCandidateNetworkRef} className={styles.graphContainer}></div>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${isAddNodeMode ? styles.activeButton : ''}`}
              onClick={() => {
                const newMode = !isAddNodeMode;
                setIsAddNodeMode(newMode);
                setIsAddEdgeMode(false);
                setEdgeSourceNode(null);
                setCursorStyle(newMode ? 'crosshair' : 'default');
              }}
            >
              {isAddNodeMode ? 'Cancel Add Node' : 'Add Node'}
            </button>
            <button
              className={`${styles.button} ${isAddEdgeMode ? styles.activeButton : ''}`}
              onClick={() => {
                const newMode = !isAddEdgeMode;
                setIsAddEdgeMode(newMode);
                setIsAddNodeMode(false);
                setEdgeSourceNode(null);
                setCursorStyle(newMode ? 'pointer' : 'default');
              }}
            >
              {isAddEdgeMode ? 'Cancel Add Edge' : 'Add Edge'}
            </button>

          </div>
        </div>

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
                <button type="submit">Save</button>
              </form>
              {selectedElement.type === 'node' && (
                <div style={{ marginTop: '10px' }}>
                  <button onClick={handleAppendNode}>Append Node</button>
                </div>
              )}
              {/* Add a Delete Button for Both Nodes and Edges */}
              <div style={{ marginTop: '10px' }}>
                <button
                  style={{ backgroundColor: '#e53935', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={handleDeleteSelectedElement}
                >
                  Delete {selectedElement.type === 'node' ? 'Node' : 'Edge'}
                </button>
              </div>
            </div>
          ) : (
            <p>Select a node or edge to view and edit its metadata.</p>
          )}
        </div>

      </div>

      <div>
        <h2>Raw batch</h2>
        <DataTable data={rawBatchRecords} />
      </div>

      <Modal open={addElementModalOpen} onClose={() => setAddElementModalOpen(false)}>
  <h3>{addingElementType === 'node' ? 'Add Node' : 'Add Edge'}</h3>
  <label>
    Label:
    <input
      value={label}
      onChange={(e) => setLabel(e.target.value)}
      placeholder={`Enter label for ${addingElementType}`}
    />
  </label>
  <button onClick={() => finalizeAddElement(label)}>Add</button>
  <button onClick={() => setAddElementModalOpen(false)}>Cancel</button>
</Modal>
{/* 
      <AddElementModal
        type={addingElementType}
        open={addElementModalOpen}
        onClose={() => setAddElementModalOpen(false)}
        onSubmit={finalizeAddElement}
      /> */}
    </Layout>
  );
}


