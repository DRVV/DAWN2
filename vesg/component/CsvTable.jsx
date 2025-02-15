import React, { useState, useEffect } from 'react';

const CsvTable = ({ csvUrl, delimiter = ',' }) => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  // Fetch and parse CSV file on component mount or when csvUrl changes.
  useEffect(() => {
    fetch(csvUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network error: ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => {
        // Split text into rows; filter out any empty lines.
        const allRows = text.split('\n').filter(row => row.trim() !== '');
        if (allRows.length === 0) return;

        // Assume the first row contains headers.
        const headerRow = allRows[0].split(delimiter);
        const dataRows = allRows.slice(1).map(row => row.split(delimiter));

        setHeaders(headerRow);
        setRows(dataRows);
      })
      .catch(err => {
        setError(err);
      });
  }, [csvUrl, delimiter]);

  if (error) {
    return <div>Error loading CSV: {error.message}</div>;
  }

  return (
    <table border="1" cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={`header-${index}`}>{header.trim()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <td key={`cell-${rowIndex}-${cellIndex}`}>{cell.trim()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CsvTable;
