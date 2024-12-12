import React from 'react';

export default function DataTable({ data }) {
  console.log(data)
  // data should be an array of arrays from your CSV parse
  // data[0] assumed as header row
  const [header, ...rows] = data;

  return (
    <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {header.map((colHeader, index) => (
            <th key={index}>{colHeader}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
