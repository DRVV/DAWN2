// pages/api/publishBatch.js

import fs from 'fs';
import path from 'path';
import { Graph } from 'graphlib';
import { write } from 'graphlib-dot';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { projectId, batchId, nodes, edges, commentMessage } = req.body;

    try {
      // Create a new graphlib Graph
      const g = new Graph({ directed: true });
      g.setGraph({});

      // Add nodes
      nodes.forEach((node) => {
        // node.data.label contains the node label
        g.setNode(node.id, { label: node.data.label || '' });
      });

      // Add edges
      edges.forEach((edge) => {
        const edgeLabel = edge.label || '';
        g.setEdge(edge.source, edge.target, { label: edgeLabel });
      });

      // Convert to DOT
      const dotOutput = write(g);

      // Save DOT file
      const batchDirectory = path.join(
        process.cwd(),
        'public',
        'static',
        'project',
        projectId,
        'batches',
        batchId
      );

      const kgCandidateDotPath = path.join(batchDirectory, 'kg_edited.dot');
      fs.writeFileSync(kgCandidateDotPath, dotOutput, 'utf8');

      // Optionally update metadata if needed
      const metadataPath = path.join(batchDirectory, 'metadata.json');
      let metadata = {};
      if (fs.existsSync(metadataPath)) {
        const metadataContent = fs.readFileSync(metadataPath, 'utf8');
        metadata = JSON.parse(metadataContent);
      }
      metadata.isPublished = true;
      metadata.commentMessage = commentMessage || metadata.commentMessage;
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

      return res.status(200).json({ success: true, message: 'Batch published and DOT file saved.' });
    } catch (error) {
      console.error('Error publishing batch:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
