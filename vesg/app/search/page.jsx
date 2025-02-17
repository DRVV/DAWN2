"use client"
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { excelFiles } from './excelFiles';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF worker:
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

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
              <PDFViewer key={file.id} pdfUrl={file.pdfUrl} />
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
