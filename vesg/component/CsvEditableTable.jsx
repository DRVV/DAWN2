// CsvEditableTable.jsx
import React, { useState } from "react";
import Papa from "papaparse";
import Autocomplete from "./Autocomplete";

function CsvEditableTable() {
  const [tableData, setTableData] = useState([]);    // array of row objects
  const [headers, setHeaders] = useState([]);        // array of column names

  // Load CSV file -> parse with Papa
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,          // CSV has a header row
      skipEmptyLines: true,  // ignore empty lines
      complete: (results) => {
        const { data, meta } = results;
        // 'data' = array of objects, each representing a row
        // 'meta.fields' = array of column names from header
        setTableData(data);
        setHeaders(meta.fields || []);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
      },
    });
  };

  /**
   * Given a column name, gather all distinct values from tableData for that column.
   * Return them in the form [{id, name}, {id, name}, ...]
   */
  const getColumnCandidates = (columnName) => {
    const uniqueValues = new Set(tableData.map((row) => row[columnName] || ""));
    return Array.from(uniqueValues).map((val, idx) => ({
      id: idx,
      name: val,
    }));
  };

  /**
   * Handle editing a single cell in the table. We'll create a *new* row object
   * so we don't mutate state directly, then update tableData with the new row.
   */
  const handleCellChange = (rowIndex, columnName, newValue) => {
    setTableData((oldData) => {
      // Make a shallow copy of the array
      const updatedData = [...oldData];
      // Copy the row we want to update
      const updatedRow = { ...updatedData[rowIndex] };
      // Change the relevant column
      updatedRow[columnName] = newValue;
      // Put this row back into the array
      updatedData[rowIndex] = updatedRow;
      return updatedData;
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Upload a CSV file to see & edit it as an Autocomplete Table</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginBottom: "16px" }}
      />

      {tableData.length === 0 ? (
        <p>No CSV data loaded yet.</p>
      ) : (
        <table 
          style={{ borderCollapse: "collapse", width: "100%", marginTop: "16px" }}
        >
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textTransform: "capitalize",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((colName) => {
                  // For each column, gather distinct column values as suggestions
                  const candidates = getColumnCandidates(colName);

                  // Current cell value is row[colName]
                  // We pass that as `value` into Autocomplete
                  // onChange updates the parent state
                  return (
                    <td key={colName} style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <Autocomplete
                        data={candidates}
                        value={row[colName] || ""}
                        onChange={(newVal) => handleCellChange(rowIndex, colName, newVal)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CsvEditableTable;
