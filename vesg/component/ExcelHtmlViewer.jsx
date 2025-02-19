import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function ExcelHtmlViewer({ excelUrl }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!excelUrl) {
      setError('No Excel URL provided');
      return;
    }

    fetch(excelUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];

        // Convert the first sheet to HTML
        const html = XLSX.write(workbook, {
          sheet: sheetName,
          type: 'string',
          bookType: 'html',
        });

        setHtmlContent(html);
        setError(null);
      })
      .catch((err) => {
        console.error('Error reading Excel file:', err);
        setError('Failed to load or convert the Excel file.');
      });
  }, [excelUrl]);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {htmlContent && (
        <div
          style={{
            marginTop: '1rem',
            border: '1px solid #ccc',
            padding: '1rem',
            // Make this container scrollable
            maxWidth: '100%',   // or a fixed pixel width if you prefer
            maxHeight: '500px', // limit vertical height
            overflow: 'auto',   // allows both horizontal and vertical scroll if needed
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </div>
  );
}

export default ExcelHtmlViewer;
