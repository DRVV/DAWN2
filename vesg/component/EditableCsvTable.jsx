// EditableCsvTable.jsx

import React, { useState } from "react";
import Autocomplete from "./Autocomplete";

/**
 * @param {string[]} columns - array of column names (headers)
 * @param {object[]} tableData - array of row objects. e.g., [{ name:"Apple", country:"USA" }, ...]
 * @param {object} candidatesMap - { columnName: [candidateValue, ...], ... }
 * @param {function} onCellChange - function(rowIndex, colName, newValue) => void
 */
function EditableCsvTable({ columns, tableData, candidatesMap, onCellChange }) {
  // Which cell is in "edit mode"? We'll store {row, col} or null
  const [editingCell, setEditingCell] = useState({ row: null, col: null });

  if (!tableData || tableData.length === 0) {
    return <p>No data to display</p>;
  }

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {columns.map((header) => (
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
            {columns.map((colName) => {
              const cellValue = row[colName] || "";
              const isEditing =
                editingCell.row === rowIndex && editingCell.col === colName;

              // Convert the array of strings to the Autocomplete data shape [{id, name}, ...]
              const colCandidates = candidatesMap[colName] || [];
              const candidateData = colCandidates.map((val, idx) => ({
                id: `${colName}-${idx}`,
                name: val,
              }));

              return (
                <td
                  key={colName}
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                >
                  {isEditing ? (
                    <div
                      // So clicking away will revert to "view mode"
                      onBlur={() => {
                        // Small delay to allow clicks in Autocomplete dropdown
                        setTimeout(() => {
                          setEditingCell({ row: null, col: null });
                        }, 100);
                      }}
                    >
                      <Autocomplete
                        data={candidateData}
                        value={cellValue}
                        onChange={(newVal) => onCellChange(rowIndex, colName, newVal)}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingCell({ row: rowIndex, col: colName })}
                    >
                      {cellValue}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EditableCsvTable;
