'use client';

import React, { useState } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import Dagre from '@dagrejs/dagre';

import EventNode from '@/component/Nodes/EventNode';
import { useSearchStore } from '@/store/searchStore';

const nodeTypes = { eventNode: EventNode };

// Main component wrapped in ReactFlowProvider so that useReactFlow can be used in the child.
export default function SearchArea() {
  return (
    <ReactFlowProvider>
      <SearchAreaContent />
    </ReactFlowProvider>
  );
}

// Child component where most of the logic happens.
function SearchAreaContent() {
  // Search and suggestion states.
  const [searchText, setSearchText] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);

  // React Flow states.
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Get fitView from React Flow context.
  const { fitView } = useReactFlow();

  // Tabs state.
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Example candidate list.
  const candidateList = [
    'Candidate 1',
    'Candidate 2',
    'Candidate 3',
    'Test Candidate',
    'Another Candidate',
  ];

  /**
   * Computes the layout for given nodes and edges using Dagre.
   * Uses default dimensions if measured sizes are not available.
   * Adds logging for each node's computed layout.
   */
  const getLayoutedElements = (incomingNodes, incomingEdges, options) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    // Set graph direction, e.g., 'LR' (left-to-right) or 'TB' (top-to-bottom).
    g.setGraph({ rankdir: options.direction });

    // Default node dimensions.
    const defaultWidth = 200;
    const defaultHeight = 50;

    // Set nodes with dimensions.
    incomingNodes.forEach((node) => {
      const width = node.measured?.width || defaultWidth;
      const height = node.measured?.height || defaultHeight;
      // Using a simple label for layout purposes.
      g.setNode(node.id, { label: node.id, width, height });
    });

    // Set edges.
    incomingEdges.forEach((edge) => g.setEdge(edge.source, edge.target));

    // Compute layout.
    Dagre.layout(g);

    // Log the computed positions for debugging.
    incomingNodes.forEach((node) => {
      const graphNode = g.node(node.id);
      console.log(
        `Computed layout for node ${node.id}: x=${graphNode.x}, y=${graphNode.y}, dims=(${graphNode.width}, ${graphNode.height})`
      );
    });

    // Update nodes with positions adjusted from center to top-left.
    const layoutedNodes = incomingNodes.map((node) => {
      const defaultWidth = 100;
      const defaultHeight = 50;
      const width = node.measured?.width || defaultWidth;
      const height = node.measured?.height || defaultHeight;
      const graphNode = g.node(node.id);
      const x = graphNode.x - width / 2;
      const y = graphNode.y - height / 2;
      return { ...node, position: { x, y } };
    });

    return {
      nodes: layoutedNodes,
      edges: incomingEdges,
    };
  };

  /* -------------
     Handlers
  ------------- */

  // Handle changes in the search input.
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.trim() === '') {
      setFilteredCandidates([]);
    } else {
      const filtered = candidateList.filter((candidate) =>
        candidate.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  // When a candidate is clicked, update the search text.
  const handleCandidateClick = (candidate) => {
    setSearchText(candidate);
    setFilteredCandidates([]);
  };

  /**
   * Fetch graph data via an API and initialize the first tab.
   */
  const triggerSearch = async () => {
    try {
      const selectedPart = useSearchStore.getState().selectedPart;
      const selectedProcess = useSearchStore.getState().selectedProcess;

      const res = await axios.post('/api/search', {
        part: selectedPart,
        process: selectedProcess,
      });

      const tabData = res.data;
      console.log(
        'DEBUG: chosen selectedPart and Process:',
        selectedPart,
        selectedProcess
      );

      setTabs(tabData);
      setActiveTab(0);

      if (tabData && tabData.length > 0) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          tabData[0].nodes || [],
          tabData[0].edges || [],
          { direction: 'TB' }
        );
        console.log('Initial layout computed for first tab:', {
          layoutedNodes,
          layoutedEdges,
        });
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        console.log('Calling fitView for first tab.');
        fitView();
      }
    } catch (error) {
      console.error('Failed to fetch search result:', error);
    }
  };

  /* -------------
     Rendering
  ------------- */

  return (
    <div>
      {/* Search Box */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: '8px' }}
        />
        <button
          onClick={triggerSearch}
          style={{ marginLeft: '10px', padding: '8px 16px' }}
        >
          Search
        </button>
      </div>

      {/* Candidate Suggestions */}
      {filteredCandidates.length > 0 && (
        <ul
          style={{
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: '5px',
            marginTop: '5px',
          }}
        >
          {filteredCandidates.map((candidate) => (
            <li
              key={candidate}
              style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => handleCandidateClick(candidate)}
            >
              {candidate}
            </li>
          ))}
        </ul>
      )}

      {/* Display Tabs and React Flow Graph if search results exist */}
      {tabs.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Search Results</h3>

          {/* Tab Headers */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #ccc',
              marginBottom: '0px',
            }}
          >
            {tabs.map((tab, index) => (
              <div
                key={index}
                onClick={() => {
                  console.log('Tab clicked, index:', index);
                  setActiveTab(index);
                  console.log('Tab data:', tab);
                  const { nodes: layoutedNodes, edges: layoutedEdges } =
                    getLayoutedElements(
                      tab.nodes || [],
                      tab.edges || [],
                      { direction: 'TB' }
                    );
                  console.log('Layouted nodes for tab:', layoutedNodes);
                  console.log('Layouted edges for tab:', layoutedEdges);
                  setNodes(layoutedNodes);
                  setEdges(layoutedEdges);
                  console.log('Calling fitView after tab change.');
                  fitView();
                }}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: activeTab === index ? '2px solid blue' : 'none',
                }}
              >
                {tab.title}
              </div>
            ))}
          </div>

          {/* Graph Display */}
          <div
            style={{
              width: '100%',
              height: '600px',
              border: '1px solid #ccc',
              borderTop: 'none',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
}
