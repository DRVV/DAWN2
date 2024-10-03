// client-app/sendGraph.js

document.getElementById('sendGraphButton').addEventListener('click', () => {
  // Sample graph data
  const graphData = {
    nodes: [
      { id: 1, label: 'CEO' },
      { id: 2, label: 'CTO' },
      { id: 3, label: 'CFO' },
      { id: 4, label: 'Engineering Manager' },
      { id: 5, label: 'Finance Manager' },
      { id: 6, label: 'Software Engineer' },
      { id: 7, label: 'Accountant' },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 4, to: 6 },
      { from: 3, to: 5 },
      { from: 5, to: 7 },
    ],
  };

  // Encode the graph data as Base64
  const encodedData = btoa(JSON.stringify(graphData));

  // Construct the Feedback App URL with the encoded graph data as a query parameter
  const feedbackAppUrl = `http://localhost:3000/?data=${encodedData}`;

  // Open the Feedback App in a new window/tab
  window.open(feedbackAppUrl, '_blank');
});
