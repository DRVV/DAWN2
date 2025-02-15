import React from "react";
import Autocomplete from "./Autocomplete";

function TableWithAutocompletes() {
  // Shared data for all autocompletes
  const sharedData1 = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Apricot" },
    { id: 3, name: "Banana" },
    { id: 4, name: "Blueberry" },
    { id: 5, name: "Cherry" },
    { id: 6, name: "Grapes" },
    { id: 7, name: "Mango" },
  ];

  const sharedData2 = [
    { id: 1, name: "USA" },
    { id: 2, name: "warota" },
    
  ];

  // Example rows (you can customize as needed)
  const rows = [1, 2, 3];

  return (
    <table style={{ borderCollapse: "collapse", width: "60%" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Column 1</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Column 2</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Column 3</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((rowIndex) => (
          <tr key={rowIndex}>
            {/* Each table cell has its own Autocomplete */}
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              <Autocomplete candidates={sharedData1} />
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              <Autocomplete candidates={sharedData1} />
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              <Autocomplete candidates={sharedData2} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableWithAutocompletes;
