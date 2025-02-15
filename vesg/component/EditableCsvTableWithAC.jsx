import React, { useState, useEffect } from 'react';

// A custom autocomplete input component.
const AutocompleteInput = ({ value, onChange, suggestions, ...props }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    if (value) {
      // Filter suggestions based on the current value (case-insensitive).
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  // Delay hiding suggestions so that clicks on suggestions are captured.
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            zIndex: 10,
            maxHeight: '150px',
            overflowY: 'auto'
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditableCsvTableWithAC = ({
  csvUrl,
  delimiter = ',',
  // autocompleteOptions: keys are header names, values are arrays of candidate strings.
  autocompleteOptions = {}
}) => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch and parse the CSV file.
  useEffect(() => {
    fetch(csvUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network error: ${response.statusText}`);
        }
        return response.text();
      })
      .then((text) => {
        const allRows = text.split('\n').filter((row) => row.trim() !== '');
        if (allRows.length === 0) return;
        const headerRow = allRows[0].split(delimiter);
        const dataRows = allRows.slice(1).map((row) => row.split(delimiter));
        setHeaders(headerRow);
        setRows(dataRows);
        setOriginalRows(dataRows);
      })
      .catch((err) => setError(err));
  }, [csvUrl, delimiter]);

  // Update a specific cell's value.
  const handleCellChange = (rowIndex, cellIndex, value) => {
    const newRows = rows.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) => (cIndex === cellIndex ? value : cell))
        : row
    );
    setRows(newRows);
  };

  // Save edits (you might want to send the updated data to your server here).
  const saveEdits = () => {
    setIsEditing(false);
    // TODO: Add persistence (e.g., API call) as needed.
  };

  // Cancel edits and revert to original data.
  const cancelEdits = () => {
    setRows(originalRows);
    setIsEditing(false);
  };

  if (error) {
    return <div>Error loading CSV: {error.message}</div>;
  }

  return (
    <div>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Disable Edit Mode' : 'Enable Edit Mode'}
      </button>
      {isEditing && (
        <>
          <button onClick={saveEdits}>Save</button>
          <button onClick={cancelEdits}>Cancel</button>
        </>
      )}
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
              {row.map((cell, cellIndex) => {
                // Check if this column has autocomplete suggestions.
                const header = headers[cellIndex];
                const suggestions = autocompleteOptions[header] || [];
                return (
                  <td key={`cell-${rowIndex}-${cellIndex}`}>
                    {isEditing ? (
                      suggestions.length > 0 ? (
                        <AutocompleteInput
                          value={cell}
                          onChange={(newValue) =>
                            handleCellChange(rowIndex, cellIndex, newValue)
                          }
                          suggestions={suggestions}
                        />
                      ) : (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) =>
                            handleCellChange(rowIndex, cellIndex, e.target.value)
                          }
                        />
                      )
                    ) : (
                      cell.trim()
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableCsvTableWithAC;
