import React, { useState } from "react";
import Papa from "papaparse";

import Autocomplete from "./Autocomplete"; // Import the Autocomplete from above

function CsvUploaderAutocomplete() {
  // State to hold parsed data from CSV
  const [csvData, setCsvData] = useState([]);

  // Handle CSV upload from <input type="file" />
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,   // Assume the CSV has header columns
      skipEmptyLines: true, // Skip empty lines
      complete: (results) => {
        // results.data will be an array of objects where
        // keys are the column headers from the CSV
        const parsedArray = results.data;
        console.log("Parsed CSV data:", parsedArray);

        // Transform the raw CSV rows to the structure needed
        // e.g. {id, name} or {name, ...} depending on your CSV columns
        const transformedData = parsedArray.map((row, index) => {
          return {
            // If your CSV doesn't have an 'id' column, use index or generate unique ID
            id: row.id ? row.id : index,
            // If your CSV column is named 'name' or something else
            // adjust accordingly, e.g. row.productName
            name: row.name,
          };
        });

        setCsvData(transformedData);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
      },
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Upload a CSV file to populate Autocomplete</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginBottom: "16px" }}
      />

      {/* Render the Autocomplete only if we have data */}
      {csvData.length > 0 ? (
        <div>
          <p>Try typing to search in the {csvData.length} items loaded from CSV:</p>
          <Autocomplete candidates={csvData} />
        </div>
      ) : (
        <p>No CSV data loaded yet.</p>
      )}
    </div>
  );
}

export default CsvUploaderAutocomplete;
