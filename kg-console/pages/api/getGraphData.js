// pages/api/getGraphData.js

import fs from 'fs';
import path from 'path';
import { read } from 'graphlib-dot';
import { graphlibToVis } from '../../utils/graphlibToVis';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { projectId, batchId } = req.query;

    const batchDirectory = path.join(
      process.cwd(),
      'public',
      'static',
      'project',
      projectId,
      'batches',
      batchId
    );

    const kgCandidateDotPath = path.join(batchDirectory, 'kg_candidate.dot');

    try {
      // Read .dot file
      const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');

      // Parse and convert to vis.js format
      const kgCandidateGraph = read(kgCandidateDotContent);
      const kgCandidateData = graphlibToVis(kgCandidateGraph);

      res.status(200).json({ kgCandidateData });
    } catch (error) {
      console.error('Error reading graph data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
