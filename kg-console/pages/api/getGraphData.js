// pages/api/getGraphData.js

import fs from 'fs';
import path from 'path';
import { read } from 'graphlib-dot';
import { graphlibToVis } from '../../utils/graphlibToVis';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { projectId, batchId } = req.query;

     // Validate inputs
     if (!projectId || !batchId) {
      return res.status(400).json({ success: false, error: 'Missing projectId or batchId' });
    }

    // Sanitize inputs (basic example)
    if (!/^[a-zA-Z0-9_-]+$/.test(projectId) || !/^[a-zA-Z0-9_-]+$/.test(batchId)) {
      return res.status(400).json({ success: false, error: 'Invalid projectId or batchId' });
    }

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

    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    // Check if kg_candidate.dot exists
    if (fs.existsSync(kgCandidateDotPath)) {
      try {
        const kgCandidateDotContent = fs.readFileSync(kgCandidateDotPath, 'utf8');
        const kgCandidateGraph = read(kgCandidateDotContent);
        const kgCandidateData = graphlibToVis(kgCandidateGraph);

        return res.status(200).json({ success: true, kgCandidateData });
      } catch (error) {
        console.error('Error reading kg_candidate.dot:', error);
        return res.status(500).json({ success: false, error: 'Failed to read kg_candidate.dot' });
      }
    } else {
      return res.status(404).json({ success: false, error: 'kg_candidate.dot not found' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
