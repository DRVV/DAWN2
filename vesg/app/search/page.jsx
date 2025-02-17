"use client"
import React, { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { excelFiles } from './excelFiles';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


// Configure the PDF worker:
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


// Reactflow component

import {
    Background,
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
  } from '@xyflow/react';
   
  import '@xyflow/react/dist/style.css';

  import StateChangeNode from '@/component/Nodes/StateChangeNode';
  import DesignTableNode from '@/component/Nodes/DesignTableNode';
  // const nodeTypes = { textUpdater: TextUpdaterNode };
  const nodeTypes = { rootTable : DesignTableNode, table: StateChangeNode}
  
  const initialNodes = [
    {
      id: '0',
      type: 'input',
      data: { label: 'Node' , dataUrl: '/data.csv', candidatesUrl: '/candidates.csv' , csvUrl: '/data.csv'},
      position: { x: 0, y: 50 },
      type: 'rootTable',
    },
  ];
   
  let id = 1;
  const getId = () => `${id++}`;
  const nodeOrigin = [0.5, 0];
   
  const AddNodeOnEdgeDrop = ({csvUrl}) => {
    const reactFlowWrapper = useRef(null);
    initialNodes[0].data.csvUrl = csvUrl;
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const onConnect = useCallback(
      (params) => setEdges((eds) => addEdge(params, eds)),
      [],
    );
   
    const onConnectEnd = useCallback(
      (event, connectionState) => {
        // when a connection is dropped on the pane it's not valid
        if (!connectionState.isValid) {
          // we need to remove the wrapper bounds, in order to get the correct position
          const id = getId();
          const { clientX, clientY } =
            'changedTouches' in event ? event.changedTouches[0] : event;
          const newNode = {
            id,
            position: screenToFlowPosition({
              x: clientX,
              y: clientY,
            }),
            data: { label: `Node ${id}`, csvUrl: csvUrl },
            origin: [0.5, 0.0],
            type: 'table',
          };
   
          setNodes((nds) => nds.concat(newNode));
          setEdges((eds) =>
            eds.concat({ id, source: connectionState.fromNode.id, target: id }),
          );
        }
      },
      [screenToFlowPosition],
    );
   
    return (
      <div className="wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          style={{ backgroundColor: "#F7F9FB" }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          fitView
          fitViewOptions={{ padding: 2 }}
          nodeOrigin={nodeOrigin}
          nodeTypes={nodeTypes}
      >
        <Background  />
      </ReactFlow>
      </div>
    );
  };


function SearchAndViewExcelAsPDF() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Placeholder for your real search logic
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // Filter files by searchTerm (case-insensitive substring match).
    const lowerCaseTerm = searchTerm.toLowerCase();
    const matchedFiles = excelFiles.filter((file) =>
      file.name.toLowerCase().includes(lowerCaseTerm)
    );

    setSearchResults(matchedFiles);
    // Set active tab to the first match (if any)
    setActiveTab(matchedFiles.length > 0 ? matchedFiles[0].id : null);
  };

  // Switch the active tab
  const handleTabClick = (fileId) => {
    setActiveTab(fileId);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>Excel File Search</h1>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search for an Excel file..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: '300px', marginRight: '0.5rem' }}
        />
        <button type="submit">Search</button>
      </form>

      {/* Tabs for matched files */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {searchResults.map((file) => (
            <button
              key={file.id}
              onClick={() => handleTabClick(file.id)}
              style={{
                marginRight: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: file.id === activeTab ? '#ccc' : 'white',
                border: '1px solid #999',
                cursor: 'pointer',
              }}
            >
              {file.name}
            </button>
          ))}
        </div>
      )}

      {/* PDF Viewer for the active tab */}
      {searchResults.length > 0 && activeTab && (
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          {searchResults
            .filter((file) => file.id === activeTab)
            .map((file) => (
                <div key={file.id}>
              <PDFViewer pdfUrl={file.pdfUrl} />
              {/* Graph editor */}
             <ReactFlowProvider>
                <AddNodeOnEdgeDrop csvUrl={file.csvUrl}/>
            </ReactFlowProvider>
            </div>
            ))}
        </div>
      )}

      {searchResults.length === 0 && (
        <p style={{ fontStyle: 'italic', color: '#666' }}>No files found.</p>
      )}

      
    </div>
  );
}

// A child component that handles PDF rendering.
function PDFViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, numPages));

  return (
    <div>
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={currentPage} />
      </Document>

      {numPages && (
        <div style={{ marginTop: '0.5rem' }}>
          <button onClick={goToPrevPage} disabled={currentPage <= 1}>
            Previous
          </button>
          <span style={{ margin: '0 1rem' }}>
            Page {currentPage} of {numPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage >= numPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchAndViewExcelAsPDF;
