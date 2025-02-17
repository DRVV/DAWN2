// CsvLoaderFromUrl.jsx

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import EditableCsvTable from "./EditableCsvTable";

/**
 * Loads two CSV files from URLs (dataUrl and candidatesUrl) using fetch + Papa Parse,
 * then renders an EditableCsvTable.
 *
 * Props:
 * - dataUrl (required): string, e.g. "/data.csv" to load from public folder
 * - candidatesUrl (optional): string, e.g. "/candidates.csv"
 */
function CsvLoaderFromUrl({ dataUrl, candidatesUrl }) {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [candidatesMap, setCandidatesMap] = useState({});

  // Fetch & parse the main table data
  useEffect(() => {
    if (!dataUrl) return; // no data to fetch
    fetchCsv(dataUrl).then((parsed) => {
      if (parsed) {
        setTableData(parsed.data);     // array of row objects
        setHeaders(parsed.meta.fields || []);
      }
    });
  }, [dataUrl]);

  // Fetch & parse the candidate CSV if provided
  useEffect(() => {
    if (!candidatesUrl) return; // might be optional
    fetchCsv(candidatesUrl).then((parsed) => {
      if (parsed) {
        // Convert array of { column, candidate } to a map
        const tempMap = {};
        parsed.data.forEach((row) => {
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
      }
    });
  }, [candidatesUrl]);

  // Reusable function to fetch & parse CSV
  const fetchCsv = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${url}, status: ${response.status}`);
        return null;
      }
      const csvText = await response.text();

      // parse with Papa
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      if (parsed.errors && parsed.errors.length > 0) {
        console.error("Papa parse errors:", parsed.errors);
      }
      return parsed; // { data: [...], meta: { fields: [...] } }
    } catch (err) {
      console.error("Error fetching CSV from", url, err);
      return null;
    }
  };

  // Called when a cell is updated
  const onCellChange = (rowIndex, colName, newValue) => {
    setTableData((old) => {
      const updated = [...old];
      const rowCopy = { ...updated[rowIndex] };
      rowCopy[colName] = newValue;
      updated[rowIndex] = rowCopy;
      return updated;
    });
  };

  // If data is loaded, show the table
  return (
    <div style={{ margin: "20px" }}>
      <h2>CSV Loader from URL</h2>
      <p>Data URL: {dataUrl}</p>
      {candidatesUrl && <p>Candidates URL: {candidatesUrl}</p>}

      {tableData.length > 0 && headers.length > 0 ? (
        <EditableCsvTable
          columns={headers}
          tableData={tableData}
          candidatesMap={candidatesMap}
          onCellChange={onCellChange}
        />
      ) : (
        <p>Loading or no data loaded yet...</p>
      )}
    </div>
  );
}

export default CsvLoaderFromUrl;
