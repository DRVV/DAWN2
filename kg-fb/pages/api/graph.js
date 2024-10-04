// pages/api/graph.js

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for production
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      // Handle preflight requests
      return res.status(200).end();
    }
  
    if (req.method === 'GET') {
      // Since we're not storing data, return an empty graph or a default graph
      const defaultGraph = { nodes: [], edges: [] };
      return res.status(200).json(defaultGraph);
    }
  
    // Method Not Allowed
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  