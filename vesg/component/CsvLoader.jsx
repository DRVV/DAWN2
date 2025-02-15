// CsvLoader.jsx

import React, { useState } from "react";
import Papa from "papaparse";
import EditableCsvTable from "./EditableCsvTable";

function CsvLoader() {
  // Table data from data.csv
  const [tableData, setTableData] = useState([]);
  // Column headers from data.csv
  const [headers, setHeaders] = useState([]);
  // Candidates from candidates.csv => { colName: [ "candidate1", "candidate2", ... ], ... }
  const [candidatesMap, setCandidatesMap] = useState({});

  // Parse the "data.csv"
  const handleDataUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta } = results;
        setTableData(data); // array of objects
        setHeaders(meta.fields || []);
      },
      error: (err) => {
        console.error("Error parsing data CSV:", err);
      },
    });
  };

  // Parse the "candidates.csv"
  // We assume columns: "column,candidate"
  const handleCandidatesUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // e.g. results.data => [ {column: "name", candidate: "Apple"}, {column: "name", candidate: "Banana"}, ... ]
        const tempMap = {};
        results.data.forEach((row) => {
          const col = row.column;
          const val = row.candidate;
          if (!col) return;
          if (!tempMap[col]) {
            tempMap[col] = [];
          }
          if (!tempMap[col].includes(val)) {
            tempMap[col].push(val);
          }
        });
        setCandidatesMap(tempMap);
      },
      error: (err) => {
        console.error("Error parsing candidates CSV:", err);
      },
    });
  };

  // Handle editing a cell in the table
  const onCellChange = (rowIndex, colName, newValue) => {
    setTableData((oldData) => {
      const updated = [...oldData];
      const rowCopy = { ...updated[rowIndex] };
      rowCopy[colName] = newValue;
      updated[rowIndex] = rowCopy;
      return updated;
    });
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>Load Table Data (data.csv)</h2>
      <input type="file" accept=".csv" onChange={handleDataUpload} />

      <h2>Load Candidates (candidates.csv)</h2>
      <input type="file" accept=".csv" onChange={handleCandidatesUpload} />

      <hr />

      <h3>Editable Table (once loaded)</h3>
      {/* Render only if we have data */}
      {tableData.length > 0 && headers.length > 0 ? (
        <EditableCsvTable
          columns={headers}
          tableData={tableData}
          candidatesMap={candidatesMap}
          onCellChange={onCellChange}
        />
      ) : (
        <p>No table data yet. Please load CSV files.</p>
      )}
    </div>
  );
}

export default CsvLoader;
