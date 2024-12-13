// pages/projects/[projectId]/batches/[batchId].js

import fs from 'fs';
import path from 'path';
import { read } from 'graphlib-dot';
import { graphlibToVis } from '../../../../utils/graphlibToVis';
import Layout from '../../../../components/Layout';
import styles from '../../../../styles/Batch.module.css';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import DataTable from '@/components/DataTable';

import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Dagre from '@dagrejs/dagre';

function EditableNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange(id, label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.onLabelChange(id, label);
    }
  };

  return (
    <div
      style={{
        padding: '5px 10px',
        border: '1px solid #222',
        borderRadius: '5px',
        background: selected ? '#f0f0f0' : '#fff',
        minWidth: '80px',
        textAlign: 'center'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span>{label}</span>
      )}
      {/* Handles to allow drawing edges:
          Drag from the right side (source handle) to another node's left side (target handle) to create an edge */}
      <Handle type="source" position="bottom" style={{ background: '#555' }} />
      <Handle type="target" position="top" style={{ background: '#555' }} />
    </div>
  );
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
  const kgCandidateDotPath = path.join(batchDirectory, 'kg_edited.dot');

  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  const metadata = JSON.parse(metadataContent);

  const kgDotContent = fs.readFileSync(kgDotPath, 'utf8');
  const kgGraph = read(kgDotContent);
  const kgData = graphlibToVis(kgGraph);

  const rawBatchPath = path.join(batchDirectory, 'raw_batch.csv');
  const rawBatchContent = fs.readFileSync(rawBatchPath, 'utf8');
  const rawBatchRecords = parse(rawBatchContent, {
    columns: false,
    skip_empty_lines: true
  });

  let kgCandidateData = null;
  if (fs.existsSync(kgCandidateDotPath)) {
    const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');
    const kgCandidateGraph = read(kgCandidateDotContent);
    kgCandidateData = graphlibToVis(kgCandidateGraph);
  } else {
    // If kg_candidate.dot does not exist, copy from kg.dot
    fs.copyFileSync(kgDotPath, kgCandidateDotPath);
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
      rawBatchRecords
    },
  };
}

// A helper function to layout the graph using Dagre
// This creates a tree-like/top-to-bottom layout
function getLayoutedElements(nodes, edges) {
  const g = new Dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB' }); // top to bottom layout
  g.setDefaultEdgeLabel(() => ({}));

  // Assume some minimal width/height for node bounding boxes
  nodes.forEach((node) => {
    g.setNode(node.id, { width: 80, height: 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const n = g.node(node.id);
    node.position = { x: n.x, y: n.y };
    return node;
  });

  return { nodes: layoutedNodes, edges };
}

export default function BatchPage({
  projectId,
  batchId,
  metadata: initialMetadata,
  kgData,
  kgCandidateData,
  rawBatchRecords
}) {
  const [isPublished, setIsPublished] = useState(initialMetadata.isPublished);
  const [commentMessage, setCommentMessage] = useState(initialMetadata.commentMessage || '');

  const onLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
  }, []);

  // Define node types
  const nodeTypes = {
    editableNode: EditableNode
  };

  // Convert original data
  const originalNodes = kgData.nodes.map((n) => ({
    id: String(n.id),
    data: { label: n.label },
    // Positions will be assigned via layout
    position: { x: 0, y: 0 },
    type: 'editableNode',
    selectable: false,
    draggable: false
  }));
  const originalEdges = kgData.edges.map((e) => ({
    id: String(e.id),
    source: String(e.from),
    target: String(e.to),
    label: e.label,
    type: 'default'
  }));

  // Layout the original graph
  const { nodes: layoutedOriginalNodes, edges: layoutedOriginalEdges } = getLayoutedElements(
    originalNodes,
    originalEdges
  );

  // Convert candidate data
  const candidateNodesData = kgCandidateData.nodes.map((n) => ({
    id: String(n.id),
    data: { label: n.label, onLabelChange },
    position: { x: 0, y: 0 }, // will be layouted
    type: 'editableNode'
  }));
  const candidateEdgesData = kgCandidateData.edges.map((e) => ({
    id: String(e.id),
    source: String(e.from),
    target: String(e.to),
    label: e.label,
    type: 'default'
  }));

  // Layout the candidate graph
  const { nodes: layoutedCandidateNodes, edges: layoutedCandidateEdges } = getLayoutedElements(
    candidateNodesData,
    candidateEdgesData
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedCandidateNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedCandidateEdges);

  const handleGenerateCandidateGraph = async () => {
    // Placeholder for actual generation logic
    console.log('Candidate graph generated (placeholder).');
  };

  const handlePublish = async () => {
    if (window.confirm('Are you sure you want to publish this batch?')) {
      // Placeholder for actual publish logic
      setIsPublished(true);
      console.log('Batch published (placeholder).');
    }
  };

  const handleRevertChanges = async () => {
    if (window.confirm('Are you sure you want to revert all changes?')) {
      // Reset to layoutedCandidateNodes and layoutedCandidateEdges
      setNodes(layoutedCandidateNodes);
      setEdges(layoutedCandidateEdges);
      console.log('Changes reverted.');
    }
  };

  return (
    <Layout>
      <h1 className={styles.heading}>{initialMetadata.title}</h1>

      <p><strong>Published:</strong> {isPublished ? '✅ Yes' : '❌ No'}</p>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handlePublish}>Publish</button>
        <button className={styles.button} onClick={handleRevertChanges}>Revert Changes</button>
        <button className={styles.button} onClick={handleGenerateCandidateGraph}>Generate Candidate Graph</button>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.currentGraphTitle}>Original</div>
        <div className={styles.candidateGraphTitle}>Edited</div>

        <div className={styles.currentGraphArea}>
          <div className={styles.graphContainer}>
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={layoutedOriginalNodes}
              edges={layoutedOriginalEdges}
              fitView
              nodesConnectable={false}
              edgesFocusable={false}
              elementsSelectable={false}
              zoomOnScroll
              panOnScroll
              panOnDrag
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>

        <div className={styles.candidateGraphArea}>
          <div className={styles.graphContainer}>
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              panOnScroll
              panOnDrag
              zoomOnPinch
              // Allows user to create edges by dragging from the source handle of one node
              // to the target handle of another node.
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>
      </div>

      <div>
        <h2>Raw batch</h2>
        <DataTable data={rawBatchRecords} />
      </div>
    </Layout>
  );
}
