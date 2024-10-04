// pages/api/get-graph-data.js
export default function handler(req, res) {
    const sampleData = {
      nodes: [
        { id: 1, label: 'Node 1' },
        { id: 2, label: 'Node 2' },
      ],
      edges: [{ from: 1, to: 2 }],
    };
    res.status(200).json(sampleData);
  }
  