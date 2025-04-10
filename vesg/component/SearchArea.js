'use client'; 
// 'use client' ensures this component can run client-side logic (like React Flow) in Next.js App Router.

import { useState } from 'react';
import { Background, ReactFlow, ReactFlowProvider, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EventNode from '@/component/Nodes/EventNode';
import { useSearchParams } from 'next/navigation';
import { useSearchStore } from '@/store/searchStore';
import axios from 'axios';

const nodeTypes = { eventNode: EventNode };

export default function SearchArea() {
  const [searchText, setSearchText] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // We'll store tab data in state. Each tab has a title and graph data: nodes & edges.
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // A simple list of candidates to demonstrate the search suggestions
  const candidateList = [
    'Candidate 1',
    'Candidate 2',
    'Candidate 3',
    'Test Candidate',
    'Another Candidate'
  ];

  /* -------------
     Handlers 
  ------------- */

  // When the user types in the search box, filter the candidate list
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim() === '') {
      setFilteredCandidates([]);
    } else {
      const filtered = candidateList.filter(candidate =>
        candidate.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  };

  // Trigger search when pressing "Enter"
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  // When a candidate is clicked, fill the input and clear suggestions
  const handleCandidateClick = (candidate) => {
    setSearchText(candidate);
    setFilteredCandidates([]);
  };

  // The main search function that sets up example tab data (including graph data)
  const triggerSearch = async() => {
    // Create example nodes & edges for each tab. In your real app, you’d load these from a server or compute them dynamically.
    try {
      const res = await axios.post('/api/search', {
        part: selectedPart,
        process: selectedProcess
      });
  
      const tabData = res.data;
  
      console.log('DEBUG: chosen selectedPart and Process:');
      console.log(selectedPart, selectedProcess);
  
      setTabs(tabData);
      setActiveTab(0);
      setNodes(tabData[0].nodes);
      setEdges(tabData[0].edges);
    } catch (error) {
      console.error('Failed to fetch search result:', error);
    }
  
    // const tabData = await res.json();


    

    // console.log('DEBUG: chosen selectedPart and Processes:');
    // console.log(selectedPart, selectedProcess);

    // // Update the tabs with the new graph data
    // // setTabs([
    // //   { title: 'Tab 1', nodes: nodesTab1, edges: edgesTab1 },
    // //   { title: 'Tab 2', nodes: nodesTab2, edges: edgesTab2 },
    // //   { title: 'Tab 3', nodes: nodesTab3, edges: edgesTab3 }
    // // ]);

    // setTabs(tabData)



    // // Switch to the first tab by default
    // setActiveTab(0);

    // setNodes(tabData[0].nodes);
    // setEdges(tabData[0].edges);
  };

  /* -------------
  search bar state
  ------------- */
  const selectedPart = useSearchStore(state => state.selectedPart);
  const selectedProcess = useSearchStore(state => state.selectedProcess);


  /* -------------
     Rendering
  ------------- */

  return (
    <div>
      {/* Search input with button */}
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

      {/* Candidate suggestions dropdown */}
      {filteredCandidates.length > 0 && (
        <ul
          style={{
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: '5px',
            marginTop: '5px'
          }}
        >
          {filteredCandidates.map(candidate => (
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

      {/* Search results as tabs with React Flow */}
      {tabs.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Search Results</h3>

          {/* Tab headers */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #ccc',
            marginBottom: '0px'
          }}>
            {tabs.map((tab, index) => (
              <div
                key={index}
                onClick={() => {setActiveTab(index); setNodes(tab.nodes); setEdges(tab.edges);}}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderBottom: activeTab === index ? '2px solid blue' : 'none'
                }}
              >
                {tab.title}
              </div>
            ))}
          </div>

          {/* Active tab content: React Flow Graph */}
          <div
            style={{
              width: '100%',
              height: '600px',
              border: '1px solid #ccc',
              borderTop: 'none'
            }}
          >
            <ReactFlowProvider>
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
            </ReactFlowProvider>
          </div>
        </div>
      )}
    </div>
  );
}
